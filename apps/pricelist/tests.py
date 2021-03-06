# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client
from django.test import TransactionTestCase
from pricelist.models import Price, PriceRule, PriceType
from pricelist.utils import get_actual_ptype
from state.models import State, Department
from service.models import BaseService, ExtendedService
import factory
import random
import datetime
from constance import config
from django.contrib.auth.models import User
from staff.models import Staff, Position
import simplejson
# from django.contrib.auth import login


class PriceTypeFactory(factory.Factory):
    FACTORY_FOR = PriceType

    name = factory.Sequence(lambda n: 'pricetype{0}'.format(n))
    priority = random.randint(100, 1000)


class PriceRuleFactory(factory.Factory):
    FACTORY_FOR = PriceRule

    price_type = factory.SubFactory(PriceTypeFactory)
    slug = 'test'
    hour = ''
    week_day = ''
    month_day = ''
    month = ''
    active = True
    # priority = random.randint(1, 100)


class StateFactory(factory.Factory):
    FACTORY_FOR = State

    name = factory.Sequence(lambda n: 'state{0}'.format(n))
    price_type = factory.SubFactory(PriceTypeFactory)
    type = 'j'


class MedStateFactory(factory.Factory):
    FACTORY_FOR = State

    name = factory.Sequence(lambda n: 'medstate{0}'.format(n))
    price_type = factory.SubFactory(PriceTypeFactory)
    type = 'p'


class BaseServiceFactory(factory.Factory):
    FACTORY_FOR = BaseService

    name = factory.Sequence(lambda n: 'base_serv{0}'.format(n))


class ExtServiceFactory(factory.Factory):
    FACTORY_FOR = ExtendedService

    base_service = factory.SubFactory(BaseServiceFactory)
    state = factory.SubFactory(MedStateFactory)
    # branches = factory.LazyAttribute(lambda a: [a.state])
    is_active = True


class PriceFactory(factory.Factory):
    FACTORY_FOR = Price

    type = factory.SubFactory(PriceTypeFactory)
    extended_service = factory.SubFactory(ExtServiceFactory)
    value = random.randint(1, 100) * 100
    on_date = datetime.date(year=2012, month=random.randint(1, 12), day=random.randint(1, 28))


class UserFactory(factory.Factory):
    FACTORY_FOR = User

    username = factory.Sequence(lambda n: 'user{0}'.format(n))
    password = '123'
    email = ''


class StaffFactory(factory.Factory):
    FACTORY_FOR = Staff

    user = factory.SubFactory(UserFactory)
    last_name = factory.Sequence(lambda n: 'Ivan{0}'.format(n))
    first_name = factory.Sequence(lambda n: 'Sokolov{0}'.format(n))
    birth_day = datetime.date(year=random.randint(1948, 1995),
                            month=random.randint(1, 12),
                            day=random.randint(1, 28))


class DepartmentFactory(factory.Factory):
    FACTORY_FOR = Department

    name = factory.Sequence(lambda n: 'department{0}'.format(n))
    state = factory.SubFactory(StateFactory)


class PositionFactory(factory.Factory):
    FACTORY_FOR = Position

    staff = factory.SubFactory(StaffFactory)
    department = factory.SubFactory(DepartmentFactory)
    title = 'manager'


class PricelistUnitTest(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        self.state1 = MedStateFactory()
        self.state2 = MedStateFactory()
        self.state3 = MedStateFactory()

        self.user = User.objects.create_user('Fred', '', '333')
        self.staff = StaffFactory.create(user=self.user, operator=self.user)
        self.dept = DepartmentFactory.create(state=self.state1)
        self.position = PositionFactory.create(staff=self.staff)

        self.gen_pt = PriceTypeFactory.create(name='Основной', priority=11000)
        self.evening_pt = PriceTypeFactory.create(name='Будни c 9 вечера до 8 утра')
        self.day_pt = PriceTypeFactory.create(name='Будни c 7 до 21:00')
        self.holiday_pt = PriceTypeFactory.create(name='Выходные')
        self.vip_pt = PriceTypeFactory.create(name='VIP клиенты')
        self.corp_pt = PriceTypeFactory.create(name='Корпоративные клиенты')
        self.buy_pt = PriceTypeFactory.create(name='Закупочная')
        PriceRuleFactory.create(price_type=self.gen_pt, priority=0)
        PriceRuleFactory.create(price_type=self.evening_pt, hour='09:00-23:59',
                                            week_day='0-4',
                                            priority=300)
        PriceRuleFactory.create(price_type=self.evening_pt, hour='00:00-08:00',
                                            week_day='0-4',
                                            priority=400)
        PriceRuleFactory.create(price_type=self.day_pt, hour='07:00-21:00',
                                            week_day='0-4',
                                            priority=500)
        PriceRuleFactory.create(price_type=self.holiday_pt, week_day='5-6',
                                            priority=600)
        self.payer1 = StateFactory.create(price_type=self.vip_pt)
        self.payer2 = StateFactory.create(price_type=self.corp_pt)
        self.payer3 = StateFactory.create(price_type=None)

        self.serv1 = ExtServiceFactory.create(state=self.state1)
        self.serv2 = ExtServiceFactory.create(state=self.state1)

    def test_create_factories(self):
        PriceTypeFactory.create(priority=111)
        PriceRuleFactory.create(priority=111)
        StateFactory.create()
        MedStateFactory.create()
        PriceFactory.create()
        BaseServiceFactory.create()
        ExtServiceFactory.create()

    def test_get_actual_ptype(self):
        # Возвращает id типа оплаты в соответствии с правилами PriceRule
        # payment_type: u'н', u'д', u'к', u'б',

        self.assertEqual(get_actual_ptype(), self.day_pt.id)
        day_07_59 = datetime.datetime(year=2012, month=12, day=6, hour=7, minute=59)
        hol_07_59 = datetime.datetime(year=2012, month=12, day=8, hour=7, minute=59)
        day_23_59 = datetime.datetime(year=2012, month=12, day=6, hour=23, minute=59)
        day_06_59 = datetime.datetime(year=2012, month=12, day=6, hour=6, minute=59)
        day_07_00 = datetime.datetime(year=2012, month=12, day=6, hour=7, minute=0)

        # TODO: если не передано ни одного параметра, функция все равно должна
        # что-нибудь вернуть в зависимости от сегодняшнего дня

        # будни день
        self.assertEqual(get_actual_ptype(date=day_07_59), self.day_pt.id)
        self.assertEqual(get_actual_ptype(date=day_07_59, payment_type=u'н'),
                         self.day_pt.id)
        self.assertEqual(get_actual_ptype(date=day_07_00), self.day_pt.id)
        # будни вечер и ночь
        self.assertEqual(get_actual_ptype(date=day_23_59), self.evening_pt.id)
        self.assertEqual(get_actual_ptype(date=day_06_59), self.evening_pt.id)
        # выходные
        self.assertEqual(get_actual_ptype(date=hol_07_59), self.holiday_pt.id)
        # если передан payer, должен возвращаться его тип оплаты не смотря на дату
        # если типа оплаты у него нет, считаем как обычно, опираясь на остальные
        # параметры: дата, тип оплаты.
        self.assertEqual(get_actual_ptype(payer=self.payer1.id),
                         self.payer1.price_type.id)
        self.assertEqual(get_actual_ptype(payer=self.payer1.id,
                                          date=day_07_59),
                         self.payer1.price_type.id)
        self.assertEqual(get_actual_ptype(payer=self.payer1.id,
                                          date=day_07_59,
                                          payment_type=u'н'),
                         self.payer1.price_type.id)
        # TODO: плательщик без установленного типа оплаты. функция должна что-то вернуть.

        # Если не указан payer и payment_type = u'д', u'к' или u'б',
        # то возвращаться должны id типов цен, указанных в настройках config
        # для соответствующего типа оплаты
        self.assertEqual(get_actual_ptype(date=day_07_59,
                                          payment_type=u'д'),
                        config.DEFAULT_PRICETYPE_INSURANCE)
        # плательщик без типа цены
        self.assertEqual(get_actual_ptype(date=day_07_59,
                                          payment_type=u'к'),
                        config.DEFAULT_PRICETYPE_CORP)
        self.assertEqual(get_actual_ptype(payer=self.payer3.id),
                        config.DEFAULT_PRICETYPE)

        self.assertEqual(get_actual_ptype(date=day_07_59,
                                          payment_type=u'б'),
                        config.DEFAULT_PRICETYPE_NONCASH)
        # Любой другой тип оплаты игнорируется и тип оплаты принимается за u'н'
        self.assertEqual(get_actual_ptype(date=day_07_59,
                                          payment_type=u'у'),
                        self.day_pt.id)

    def test_get_actual_price(self):
        # get_actual_price - метод расширенной  услуги ExtendedService
        # в качестве параметров может принимать:
        # - date - дату, на какую нужно узнать цену,
        # - payment_type - тип оплаты,
        # - payer - плательщик
        # - p_type - тип цены
        nov13 = datetime.datetime(year=2012, month=11, day=13)
        dec26 = datetime.datetime(year=2012, month=12, day=26)

        # цена для vip клиентов для serv1
        serv1_vip_price1 = PriceFactory.create(extended_service=self.serv1,
                                    type=self.vip_pt,
                                    on_date=datetime.datetime(year=2012, month=12, day=6))

        serv1_vip_price2 = PriceFactory.create(extended_service=self.serv1,
                                    type=self.vip_pt,
                                    on_date=datetime.datetime(year=2012, month=11, day=6))
        #цена по умолчанию для serv1
        PriceFactory.create(extended_service=self.serv1,
                                    type=self.gen_pt,
                                    on_date=datetime.datetime(year=2012, month=1, day=1))
        # цена по умолчанию для serv1, установленная через пол года
        PriceFactory.create(extended_service=self.serv1,
                                    type=self.gen_pt,
                                    on_date=datetime.datetime(year=2012, month=9, day=1))

        # цена для корпоративных клиентов для serv1
        PriceFactory.create(extended_service=self.serv1,
                                    type=self.corp_pt,
                                    on_date=datetime.datetime(year=2012, month=12, day=6))

        serv1_corp_price2 = PriceFactory.create(extended_service=self.serv1,
                                    type=self.corp_pt,
                                    on_date=datetime.datetime(year=2012, month=11, day=6))

        serv2_gen_price1 = PriceFactory.create(extended_service=self.serv2,
                                    type=self.gen_pt,
                                    on_date=datetime.datetime(year=2012, month=1, day=1))
        # цена по умолчанию для serv1, установленная через пол года
        PriceFactory.create(extended_service=self.serv2,
                                    type=self.gen_pt,
                                    on_date=datetime.datetime(year=2012, month=9, day=1))

        # Проверим, что на разную дату приходит разная цена
        # Если передан тип цены, то должна вернуться актуальная цена этого типа цены
        self.assertEqual(self.serv1.get_actual_price(date=nov13,
                                                    p_type=self.vip_pt),
                        serv1_vip_price1.value)

        # Если тип цены не передан, но передан плательщик, то если у плательщика
        # есть тип цены, должна вернуться цена этого типа цены
        # если типа цены нет, цена должна рассчитаться исходя из переданной даты
        # или сегодняшнего дня.
        #
        #
        self.assertEqual(self.serv1.get_actual_price(date=nov13,
                                                    payer=self.payer1.id),
                        serv1_vip_price1.value)
        self.assertEqual(self.serv1.get_actual_price(date=nov13,
                                                    payer=self.payer3.id,
                                                    p_type=self.vip_pt),
                        serv1_vip_price1.value)
        self.assertEqual(self.serv1.get_actual_price(date=dec26,
                                                    payer=self.payer1.id),
                        serv1_vip_price2.value)
        self.assertEqual(self.serv1.get_actual_price(date=dec26,
                                                    payer=self.payer2.id),
                        serv1_corp_price2.value)
        # Цена для другой услуги
        self.assertEqual(self.serv1.get_actual_price(date=nov13,
                                                    p_type=self.gen_pt),
                         serv2_gen_price1.value)


class ServiceTreeTest(TransactionTestCase):
    """
    Функция построения дерева услуг с актуальными ценами
    Возможные режимы работы:
        дерево в форме визита
        дерево в редакторе шаблонов врача
        дерево в направлениях
        дерево в окне управления услугами

    Принимаемые параметры:
        ext - вывод не для формы визита
        staff - выводит услуги, которые выполняет указанный staff
        state - услуги указанной организации. Если не указано,
                берется главная организация из constance
        on_date - цены актуализируются на указанную дату;
                  если не указана - берется сегодняшняя
        all - дает возможность вывести услуги всех организаций
        payment_type - тип оплаты. По умолчанию u'н'
        payer - плательщик

    """

    maxDiff = None

    def setUp(self):
        self.gen_pt = PriceTypeFactory.create(name='Основной', priority=11000)
        self.evening_pt = PriceTypeFactory.create(name='Будни c 9 вечера до 8 утра')
        self.day_pt = PriceTypeFactory.create(name='Будни c 7 до 21:00')
        self.holiday_pt = PriceTypeFactory.create(name='Выходные')
        self.vip_pt = PriceTypeFactory.create(name='VIP клиенты')
        self.corp_pt = PriceTypeFactory.create(name='Корпоративные клиенты')
        self.buy_pt = PriceTypeFactory.create(name='Закупочная')
        PriceRuleFactory.create(price_type=self.gen_pt, priority=0)
        PriceRuleFactory.create(price_type=self.evening_pt, hour='09:00-23:59',
                                            week_day='0-4',
                                            priority=300)
        PriceRuleFactory.create(price_type=self.evening_pt, hour='00:00-08:00',
                                            week_day='0-4',
                                            priority=400)
        PriceRuleFactory.create(price_type=self.day_pt, hour='07:00-21:00',
                                            week_day='0-4',
                                            priority=500)
        PriceRuleFactory.create(price_type=self.holiday_pt, week_day='5-6',
                                            priority=600)

        self.state1 = MedStateFactory()
        self.state2 = MedStateFactory()
        self.state3 = MedStateFactory()

        self.user1 = User.objects.create_user('Fred', '', '333')
        self.user2 = User.objects.create_user('Robert', '', '432')
        self.staff1 = StaffFactory.create(user=self.user1, operator=self.user1)
        self.staff2 = StaffFactory.create(user=self.user2, operator=self.user2)
        self.dept1 = DepartmentFactory.create(state=self.state1)
        self.dept2 = DepartmentFactory.create(state=self.state2)
        self.position1 = PositionFactory.create(staff=self.staff1,
                                                department=self.dept1)
        self.position2 = PositionFactory.create(staff=self.staff2,
                                                department=self.dept2)

        self.payer1 = StateFactory.create(price_type=self.vip_pt)
        self.payer2 = StateFactory.create(price_type=self.corp_pt)
        self.payer3 = StateFactory.create(price_type=None)
        """
        У нас есть дерево услуг со следующей структурой:
        /---
            |--group1
            |    |-bs1
            |    |  |-serv1-state1: staff1, staff2
            |    |  |   |-price1: 01.01.2012 gen_pt
            |    |  |   |-price2: 01.09.2012 gen_pt
            |    |  |   |-price3: 01.09.2012 evening_pt
            |    |  |   |-price4: 01.01.2012 corp_pt
            |    |  |   |-price5: 01.09.2012 corp_pt
            |    |  |   |-price6: 01.09.2012 vip_pt
            |    |  |   |-price7: 01.09.2012 day_pt
            |    |  |-serv2-state2: staff1
            |    |  |   |-price8: 01.01.2012 gen_pt
            |    |  |   |-price9: 01.09.2012 gen_pt
            |    |  |   |-price10: 01.01.2012 corp_pt
            |    |  |   |-price11: 01.01.2012 vip_pt
            |    |  |   |-price12: 01.09.2012 vip_pt
            |    |  |   |-price13: 01.01.2012 day_pt
            |    |-bs2
            |    |  |-serv3-state2: staff2
            |    |  |   |-price14: 01.01.2012 gen_pt
            |    |  |   |-price15: 01.01.2012 corp_pt
            |    |  |   |-price16: 01.09.2012 corp_pt
            |    |  |   |-price17: 01.01.2012 vip_pt
            |    |  |   |-price18: 01.09.2012 vip_pt
            |    |  |   |-price19: 01.09.2012 day_pt
            |
            |--group2
            |    |-bs3
            |    |  |-serv4-state1,state2: staff1, staff2
            |    |  |   |-price20: 01.01.2012 gen_pt
            |    |  |   |-price21: 01.09.2012 gen_pt
            |    |  |   |-price22: 01.01.2012 corp_pt
            |    |  |   |-price23: 01.09.2012 day_pt
            |    |-group3
            |    |    |-bs4
            |
            |--group4
        """

        # Если выбрана дата, на которую не назначена цена для типа цены этой даты
        # например выходные

        self.jan01 = datetime.date(year=2012, month=1, day=1)
        self.sep01 = datetime.date(year=2012, month=9, day=1)
        self.group1 = BaseServiceFactory.create(is_group=True, name='group1')
        self.group2 = BaseServiceFactory.create(is_group=True, name='group2')
        self.group3 = BaseServiceFactory.create(is_group=True,
                                                parent=self.group2,
                                                name='group3')
        self.group4 = BaseServiceFactory.create(is_group=True, name='group4')
        self.bs1 = BaseServiceFactory.create(is_group=False,
                                             parent=self.group1,
                                             name='bs1')
        self.serv1 = ExtServiceFactory.create(state=self.state1, base_service=self.bs1)
        self.serv1.staff = [self.position1, self.position2]
        self.serv1.branches = [self.state1]
        self.serv1.save()
        self.price1 = PriceFactory.create(on_date=self.jan01,
                                     extended_service=self.serv1,
                                     type=self.gen_pt)
        self.price2 = PriceFactory.create(on_date=self.sep01,
                                     extended_service=self.serv1,
                                     type=self.gen_pt)
        self.price3 = PriceFactory.create(on_date=self.sep01,
                                     extended_service=self.serv1,
                                     type=self.evening_pt)
        self.price4 = PriceFactory.create(on_date=self.jan01,
                                     extended_service=self.serv1,
                                     type=self.corp_pt)
        self.price5 = PriceFactory.create(on_date=self.sep01,
                                     extended_service=self.serv1,
                                     type=self.corp_pt)
        self.price6 = PriceFactory.create(on_date=self.sep01,
                                     extended_service=self.serv1,
                                     type=self.vip_pt)
        self.price7 = PriceFactory.create(on_date=self.sep01,
                                     extended_service=self.serv1,
                                     type=self.day_pt)

        self.serv2 = ExtServiceFactory.create(state=self.state2,
                                              base_service=self.bs1)
        self.serv2.staff = [self.position1]
        self.serv2.branches = [self.state2]
        self.serv2.save()
        self.price8 = PriceFactory.create(on_date=self.jan01,
                                     extended_service=self.serv2,
                                     type=self.gen_pt)
        self.price9 = PriceFactory.create(on_date=self.jan01,
                                     extended_service=self.serv2,
                                     type=self.gen_pt)
        self.price10 = PriceFactory.create(on_date=self.sep01,
                                     extended_service=self.serv2,
                                     type=self.corp_pt)
        self.price11 = PriceFactory.create(on_date=self.jan01,
                                     extended_service=self.serv2,
                                     type=self.vip_pt)
        self.price12 = PriceFactory.create(on_date=self.sep01,
                                     extended_service=self.serv2,
                                     type=self.vip_pt)
        self.price13 = PriceFactory.create(on_date=self.sep01,
                                     extended_service=self.serv2,
                                     type=self.day_pt)

        self.bs2 = BaseServiceFactory.create(is_group=False,
                                             parent=self.group1,
                                             name='bs2')
        self.serv3 = ExtServiceFactory.create(state=self.state2,
                                              base_service=self.bs2)
        self.serv3.staff = [self.position2]
        self.serv3.branches = [self.state2]
        self.serv3.save()
        self.price14 = PriceFactory.create(on_date=self.jan01,
                                     extended_service=self.serv3,
                                     type=self.gen_pt)
        self.price15 = PriceFactory.create(on_date=self.sep01,
                                     extended_service=self.serv3,
                                     type=self.corp_pt)
        self.price16 = PriceFactory.create(on_date=self.jan01,
                                     extended_service=self.serv3,
                                     type=self.corp_pt)
        self.price17 = PriceFactory.create(on_date=self.jan01,
                                     extended_service=self.serv3,
                                     type=self.vip_pt)
        self.price18 = PriceFactory.create(on_date=self.sep01,
                                     extended_service=self.serv3,
                                     type=self.vip_pt)
        self.price19 = PriceFactory.create(on_date=self.jan01,
                                     extended_service=self.serv3,
                                     type=self.day_pt)

        self.bs3 = BaseServiceFactory.create(is_group=False,
                                             parent=self.group2,
                                             name='bs3')
        self.serv4 = ExtServiceFactory.create(state=self.state1, base_service=self.bs3)
        self.serv4.staff = [self.position1, self.position2]
        self.serv4.branches = [self.state1]
        self.serv4.save()
        self.price20 = PriceFactory.create(on_date=self.jan01,
                                     extended_service=self.serv4,
                                     type=self.gen_pt)
        self.price21 = PriceFactory.create(on_date=self.sep01,
                                     extended_service=self.serv4,
                                     type=self.gen_pt)
        self.price22 = PriceFactory.create(on_date=self.jan01,
                                     extended_service=self.serv4,
                                     type=self.corp_pt)
        self.price23 = PriceFactory.create(on_date=self.sep01,
                                     extended_service=self.serv4,
                                     type=self.day_pt)

        self.bs4 = BaseServiceFactory.create(is_group=False, parent=self.group3,
                                             name='bs4')
        self.maxDif = None

    def dec(self, value):
        return "%s%s" % (value, '.00')

    def test_get_service_tree(self):
        # Проверяем, что адрес существует
        client = Client()
        client.login(username='Fred', password='333')
        response = client.get('/service/service_tree/')
        self.assertEqual(response.status_code, 200)
        # Если в параметрах ничего не передано, должно что-то вернуться
        self.assertEqual(isinstance(simplejson.loads(response.content), list), True)

        # Указан плательщик с типом цены corp_pt на 12 ноября

        """
        Должно вернуть следующее:
        /---
            |--group1
            |    |-bs1
            |       |-serv1-state1: staff1, staff2
            |           |-price5: 01.09.2012 corp_pt
            |
            |--group2
                 |-bs3
                    |-serv4-state1: staff1, staff2
                        |-price22: 01.01.2012 corp_pt
        """
        result_wanted = [{
            "id": int(self.group1.id),
            "leaf": False,
            'text': "%s" % (self.group1.short_name or self.group1.name,),
            'singleClickExpand': True,
            "parent": self.group1.get_parent(),
            'children': [{
                "id": '%s-%s' % (int(self.bs1.id), int(self.position1.department.state.id)),
                "text": "%s" % (self.bs1.short_name or self.bs1.name),
                "cls": "multi-line-text-node",
                "price": self.dec(self.price5.value),
                "exec_time": str("%s" % (self.bs1.execution_time and u"%s мин" % self.bs1.execution_time or u'')),
                "iconCls": "ex-place-%s" % self.serv1.state.id,
                "parent": self.bs1.get_parent(),
                "leaf": True,
                "staff": [[int(self.position1.id), str(self.position1.__unicode__())],
                          [int(self.position2.id), str(self.position2.__unicode__())]]
            }]
        }, {
            "id": int(self.group2.id),
            "leaf": False,
            'text': "%s" % (self.group2.short_name or self.group2.name,),
            'singleClickExpand': True,
            "parent": self.group2.get_parent(),
            'children': [{
                "id": '%s-%s' % (self.bs3.id, self.position1.department.state.id),
                "text": "%s" % (self.bs3.short_name or self.bs3.name),
                "cls": "multi-line-text-node",
                "price": self.dec(self.price22.value),
                "exec_time": str("%s" % (self.bs3.execution_time and u"%s мин" % self.bs3.execution_time or u'')),
                "iconCls": "ex-place-%s" % self.serv4.state.id,
                "parent": self.bs3.get_parent(),
                "leaf": True,
                "staff": [[int(self.position1.id), str(self.position1.__unicode__())],
                          [int(self.position2.id), str(self.position2.__unicode__())]]
            }]
        }]

        response = client.get('/service/service_tree/',
                              {'payer': self.payer2.id,
                               'on_date': datetime.date(year=2012,
                                                        month=11,
                                                        day=12)
                               })
        self.assertEqual(result_wanted, simplejson.loads(response.content))


class PricelistApiTest(unittest.TestCase):

    def test_pricelist_discount(self):
        client = Client()
        response = client.get('/api/pricelist/discount')
        self.assertEqual(response.status_code, 200)
