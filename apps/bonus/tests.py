# -*- coding: utf-8 -*-


import factory
import random
import datetime
import simplejson

from constance import config
from django.utils import unittest
from django.test.client import Client
from django.test import TransactionTestCase
from django.contrib.auth.models import User

from numeration.models import Barcode
from pricelist.models import Price, PriceType
from patient.models import Patient, ContractType, Contract
from state.models import State, Department
from service.models import BaseService, ExtendedService
from staff.models import Staff, Position
from scheduler.models import Preorder
from visit.models import Referral, Visit, OrderedService

from .models import BonusServiceGroup, BonusRule, BonusRuleItem, BonusRuleItemHistory, Calculation, CalculationItem
from .utils import process_calculation, get_detail_result, get_category_result


class PriceTypeFactory(factory.Factory):
    FACTORY_FOR = PriceType

    name = factory.Sequence(lambda n: 'pricetype{0}'.format(n))


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

    name = factory.Sequence(lambda n: 'BaseService_{0}'.format(n))
    type = 'cons'


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
    email = ''


class ReferralFactory(factory.Factory):
    FACTORY_FOR = Referral

    operator = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: 'Referral{0}'.format(n))


class StaffFactory(factory.Factory):
    FACTORY_FOR = Staff

    operator = factory.SubFactory(UserFactory)
    last_name = factory.Sequence(lambda n: 'Ivan{0}'.format(n))
    first_name = factory.Sequence(lambda n: 'Sokolov{0}'.format(n))
    birth_day = datetime.date(year=random.randint(1948, 1995),
                            month=random.randint(1, 12),
                            day=random.randint(1, 28))
    # referral = factory.SubFactory(ReferralFactory)


class DepartmentFactory(factory.Factory):
    FACTORY_FOR = Department

    name = factory.Sequence(lambda n: 'department{0}'.format(n))
    state = factory.SubFactory(StateFactory)


class PositionFactory(factory.Factory):
    FACTORY_FOR = Position

    staff = factory.SubFactory(StaffFactory)
    department = factory.SubFactory(DepartmentFactory)
    title = 'manager'


class PatientFactory(factory.Factory):
    FACTORY_FOR = Patient

    operator = factory.SubFactory(UserFactory)
    last_name = factory.Sequence(lambda n: 'Patient_{0}'.format(n))
    first_name = factory.Sequence(lambda n: 'Name_{0}'.format(n))
    birth_day = datetime.date(year=random.randint(1948, 1995),
                            month=random.randint(1, 12),
                            day=random.randint(1, 28))


class ContractTypeFactory(factory.Factory):
    FACTORY_FOR = ContractType

    title = factory.Sequence(lambda n: 'ContractType{0}'.format(n))
    validity = 0


class ContractFactory(factory.Factory):
    FACTORY_FOR = Contract

    created = datetime.date.today()
    expire = datetime.date.today() + datetime.timedelta(100)
    contract_type = factory.SubFactory(ContractTypeFactory)
    patient = factory.SubFactory(PatientFactory)


class BarcodeFactory(factory.Factory):
    FACTORY_FOR = Barcode


class VisitFactory(factory.Factory):
    FACTORY_FOR = Visit

    operator = factory.SubFactory(UserFactory)
    # cls = u'п'
    office = factory.SubFactory(StateFactory)
    patient = factory.SubFactory(PatientFactory)
    # referral = factory.SubFactory(ReferralFactory)
    barcode = factory.SubFactory(BarcodeFactory)
    contract = factory.SubFactory(ContractFactory)


class OrderedServiceFactory(factory.Factory):
    FACTORY_FOR = OrderedService

    operator = factory.SubFactory(UserFactory)
    order = factory.SubFactory(VisitFactory)
    service = factory.SubFactory(BaseServiceFactory)
    execution_place = factory.SubFactory(StateFactory)
    # staff = factory.SubFactory(PositionFactory)


class PreorderFactory(factory.Factory):
    FACTORY_FOR = Preorder


class BonusServiceGroupFactory(factory.Factory):
    FACTORY_FOR = BonusServiceGroup

    name = factory.Sequence(lambda n: 'BonusServiceGroup{0}'.format(n))
    slug = factory.Sequence(lambda n: 'bonus-slug-{0}'.format(n))


class BonusRuleFactory(factory.Factory):
    FACTORY_FOR = BonusRule


class BonusRuleItemFactory(factory.Factory):
    FACTORY_FOR = BonusRuleItem

    rule = factory.SubFactory(BonusRuleFactory)
    on_date = datetime.date.today()
    value = random.randint(1, 50) * 10
    # service_group = factory.SubFactory(BonusServiceGroupFactory)


class BonusRuleItemHistoryFactory(factory.Factory):
    FACTORY_FOR = BonusRuleItemHistory

    rule_item = factory.SubFactory(BonusRuleItemFactory)
    on_date = datetime.date.today()
    value = random.randint(1, 50) * 10


class BonusUnitTest(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        self.super_user = UserFactory.create(username='super', password='super', is_superuser=True, is_staff=True)
        self.year_start = datetime.date(year=2013, month=1, day=1)
        self.gen_pt = PriceTypeFactory.create(name='Основной', priority=1)

        self.referral_ext_1 = ReferralFactory(referral_type=u'в')
        self.referral_ext_2 = ReferralFactory(referral_type=u'в')

        self.referral_staff_1 = ReferralFactory(referral_type=u'л')
        self.referral_staff_2 = ReferralFactory(referral_type=u'к')

        self.state1 = StateFactory.create(type='b')
        self.state2 = StateFactory.create(type='b')

        self.dept1 = DepartmentFactory.create(state=self.state1)
        self.dept2 = DepartmentFactory.create(state=self.state2)

        self.staff1 = StaffFactory.create(referral=self.referral_staff_1)
        self.staff2 = StaffFactory.create(referral=self.referral_staff_2)
        self.staff3 = StaffFactory.create()

        self.position1 = PositionFactory.create(staff=self.staff1,
                                                department=self.dept1)
        self.position2 = PositionFactory.create(staff=self.staff2,
                                                department=self.dept2)
        self.position3 = PositionFactory.create(staff=self.staff3,
                                                department=self.dept1)

        self.create_service_sequence(range(0, 5), self.state1, [self.position1], self.gen_pt, self.year_start)
        self.create_service_sequence(range(5, 10), self.state2, [self.position2], self.gen_pt, self.year_start)
        self.create_service_sequence(range(10, 15), self.state1, [], self.gen_pt, self.year_start)
        self.create_service_sequence(range(15, 20), self.state1, [self.position3], self.gen_pt, self.year_start)

        self.assertIsNotNone(getattr(self, 'bs0'))
        self.assertIsInstance(self.bs0, BaseService)

        ###  visit 1

        self.visit1 = VisitFactory.create(office=self.state1, referral=self.referral_ext_1)
        OrderedServiceFactory.create(
            order=self.visit1,
            service=self.bs0,
            execution_place=self.state1,
            staff=self.position1
        )
        OrderedServiceFactory.create(
            order=self.visit1,
            service=self.bs1,
            execution_place=self.state1,
            staff=self.position1
        )
        OrderedServiceFactory.create(
            order=self.visit1,
            service=self.bs10,
            execution_place=self.state1,
        )
        OrderedServiceFactory.create(
            order=self.visit1,
            service=self.bs11,
            execution_place=self.state1,
        )

        ###  visit 2

        self.visit2 = VisitFactory.create(office=self.state1, referral=self.referral_ext_2)
        self.preorder1 = PreorderFactory(referral=self.referral_staff_1, visit=self.visit2)
        OrderedServiceFactory.create(
            order=self.visit2,
            service=self.bs2,
            execution_place=self.state1,
            staff=self.position1
        )
        OrderedServiceFactory.create(
            order=self.visit2,
            service=self.bs5,
            execution_place=self.state2,
            staff=self.position2
        )
        OrderedServiceFactory.create(
            order=self.visit2,
            service=self.bs6,
            execution_place=self.state2,
            staff=self.position2,
            assigment=self.preorder1
        )
        OrderedServiceFactory.create(
            order=self.visit2,
            service=self.bs12,
            execution_place=self.state1,
            assigment=self.preorder1
        )
        OrderedServiceFactory.create(
            order=self.visit2,
            service=self.bs13,
            execution_place=self.state1,
            assigment=self.preorder1
        )

        ###  visit 3

        self.visit3 = VisitFactory.create(office=self.state1, referral=self.referral_ext_2)
        OrderedServiceFactory.create(
            order=self.visit3,
            service=self.bs3,
            execution_place=self.state1,
            staff=self.position1
        )
        OrderedServiceFactory.create(
            order=self.visit3,
            service=self.bs16,
            execution_place=self.state1,
            staff=self.position3
        )
        OrderedServiceFactory.create(
            order=self.visit3,
            service=self.bs17,
            execution_place=self.state1,
            staff=self.position3
        )
        OrderedServiceFactory.create(
            order=self.visit3,
            service=self.bs14,
            execution_place=self.state1,
        )
        OrderedServiceFactory.create(
            order=self.visit3,
            service=self.bs15,
            execution_place=self.state1,
        )

        ###  visit 4

        self.visit4 = VisitFactory.create(office=self.state1)
        self.preorder2 = PreorderFactory(referral=self.referral_staff_2, visit=self.visit4)
        OrderedServiceFactory.create(
            order=self.visit4,
            service=self.bs18,
            execution_place=self.state1,
            staff=self.position3
        )
        OrderedServiceFactory.create(
            order=self.visit4,
            service=self.bs19,
            execution_place=self.state1,
            staff=self.position3,
            assigment=self.preorder2
        )
        OrderedServiceFactory.create(
            order=self.visit4,
            service=self.bs11,
            execution_place=self.state1,
            assigment=self.preorder2
        )
        OrderedServiceFactory.create(
            order=self.visit4,
            service=self.bs12,
            execution_place=self.state1,
            assigment=self.preorder2
        )
        OrderedServiceFactory.create(
            order=self.visit4,
            service=self.bs13,
            execution_place=self.state1,
            assigment=self.preorder2
        )

        ## bonuses

        self.service_group_1 = BonusServiceGroupFactory.create()
        self.service_group_1.services.add(self.bs0, self.bs1, self.bs2, self.bs3)

        self.service_group_2 = BonusServiceGroupFactory.create()
        self.service_group_2.services.add(self.bs4, self.bs5, self.bs6, self.bs7)

        self.service_group_3 = BonusServiceGroupFactory.create()
        self.service_group_3.services.add(self.bs8, self.bs9)

        self.service_group_4 = BonusServiceGroupFactory.create()
        self.service_group_4.services.add(self.bs10, self.bs11, self.bs12, self.bs13, self.bs14)

        self.service_group_5 = BonusServiceGroupFactory.create()
        self.service_group_5.services.add(self.bs15, self.bs16, self.bs17, self.bs18, self.bs19)

        # врач клиники, собственные услуги

        self.rule_k_staff = BonusRuleFactory.create(category=u'к', source='staff__staff__referral')

        BonusRuleItemFactory.create(
            rule=self.rule_k_staff,
            on_date=self.year_start,
            operation='a',
            value=50,
            service_group=self.service_group_1
        )

        BonusRuleItemFactory.create(
            rule=self.rule_k_staff,
            on_date=self.year_start,
            operation='a',
            value=55,
            service_group=self.service_group_2
        )

        BonusRuleItemFactory.create(
            rule=self.rule_k_staff,
            on_date=self.year_start,
            operation='a',
            value=170,
            service_group=self.service_group_3
        )

        BonusRuleItemFactory.create(
            rule=self.rule_k_staff,
            on_date=self.year_start,
            operation='%',
            value=3,
            service_group=self.service_group_4
        )

        BonusRuleItemFactory.create(
            rule=self.rule_k_staff,
            on_date=self.year_start,
            operation='a',
            value=210,
            service_group=self.service_group_5
        )

        # врач клиники, направления

        self.rule_k_preorder_staff = BonusRuleFactory.create(category=u'к', source='assigment__referral')

        BonusRuleItemFactory.create(
            rule=self.rule_k_preorder_staff,
            on_date=self.year_start,
            operation='a',
            value=50,
            service_group=self.service_group_1
        )

        BonusRuleItemFactory.create(
            rule=self.rule_k_preorder_staff,
            on_date=self.year_start,
            operation='a',
            value=55,
            service_group=self.service_group_2
        )

        BonusRuleItemFactory.create(
            rule=self.rule_k_preorder_staff,
            on_date=self.year_start,
            operation='a',
            value=170,
            service_group=self.service_group_3
        )

        BonusRuleItemFactory.create(
            rule=self.rule_k_preorder_staff,
            on_date=self.year_start,
            operation='%',
            value=3,
            service_group=self.service_group_4
        )

        BonusRuleItemFactory.create(
            rule=self.rule_k_preorder_staff,
            on_date=self.year_start,
            operation='a',
            value=210,
            service_group=self.service_group_5
        )

        # лечащий врач, собственные услуги

        self.rule_l_staff = BonusRuleFactory.create(category=u'л', source='staff__staff__referral')

        BonusRuleItemFactory.create(
            rule=self.rule_l_staff,
            on_date=self.year_start,
            operation='a',
            value=57,
            service_group=self.service_group_1
        )

        BonusRuleItemFactory.create(
            rule=self.rule_l_staff,
            on_date=self.year_start,
            operation='a',
            value=63,
            service_group=self.service_group_2
        )

        BonusRuleItemFactory.create(
            rule=self.rule_l_staff,
            on_date=self.year_start,
            operation='a',
            value=188,
            service_group=self.service_group_3
        )

        BonusRuleItemFactory.create(
            rule=self.rule_l_staff,
            on_date=self.year_start,
            operation='%',
            value=3.5,
            service_group=self.service_group_4
        )

        BonusRuleItemFactory.create(
            rule=self.rule_l_staff,
            on_date=self.year_start,
            operation='a',
            value=215,
            service_group=self.service_group_5
        )

        self.rule_l_preorder_staff = BonusRuleFactory.create(category=u'л', source='assigment__referral')

        BonusRuleItemFactory.create(
            rule=self.rule_l_preorder_staff,
            on_date=self.year_start,
            operation='a',
            value=57,
            service_group=self.service_group_1
        )

        BonusRuleItemFactory.create(
            rule=self.rule_l_preorder_staff,
            on_date=self.year_start,
            operation='a',
            value=63,
            service_group=self.service_group_2
        )

        BonusRuleItemFactory.create(
            rule=self.rule_l_preorder_staff,
            on_date=self.year_start,
            operation='a',
            value=188,
            service_group=self.service_group_3
        )

        BonusRuleItemFactory.create(
            rule=self.rule_l_preorder_staff,
            on_date=self.year_start,
            operation='%',
            value=3.5,
            service_group=self.service_group_4
        )

        BonusRuleItemFactory.create(
            rule=self.rule_l_preorder_staff,
            on_date=self.year_start,
            operation='a',
            value=215,
            service_group=self.service_group_5
        )

        self.rule_v_staff = BonusRuleFactory.create(category=u'в', source='order__referral')

        BonusRuleItemFactory.create(
            rule=self.rule_v_staff,
            on_date=self.year_start,
            operation='a',
            value=100,
            service_group=self.service_group_1
        )

        BonusRuleItemFactory.create(
            rule=self.rule_v_staff,
            on_date=self.year_start,
            operation='a',
            value=110,
            service_group=self.service_group_2
        )

        BonusRuleItemFactory.create(
            rule=self.rule_v_staff,
            on_date=self.year_start,
            operation='a',
            value=200,
            service_group=self.service_group_3
        )

        BonusRuleItemFactory.create(
            rule=self.rule_v_staff,
            on_date=self.year_start,
            operation='%',
            value=5,
            service_group=self.service_group_4
        )

        BonusRuleItemFactory.create(
            rule=self.rule_v_staff,
            on_date=self.year_start,
            operation='a',
            value=250,
            service_group=self.service_group_5
        )

    def test_visit_total_price(self):
        s1 = self.state1
        s2 = self.state2

        # price1
        price = self.bs0.price(s1) + self.bs1.price(s1) + self.bs10.price(s1) + self.bs11.price(s1)
        self.assertEqual(self.visit1.total_price, price)

        # price2
        price = self.bs2.price(s1) + self.bs5.price(s2) + self.bs6.price(s2) + self.bs12.price(s1) + self.bs13.price(s1)
        self.assertEqual(self.visit2.total_price, price)

        # price3
        price = self.bs3.price(s1) + self.bs16.price(s1) + self.bs17.price(s1) + self.bs14.price(s1) + self.bs15.price(s1)
        self.assertEqual(self.visit3.total_price, price)

        # price4
        price = self.bs18.price(s1) + self.bs19.price(s1) + self.bs11.price(s1) + self.bs12.price(s1) + self.bs13.price(s1)
        self.assertEqual(self.visit4.total_price, price)

    def test_calculation(self):
        """
        referral_ext_1: 4
        referral_ext_2: 10
        """
        cats = {
            u'в': 14,
            u'л': 7,
            u'к': 6,
        }
        for cat in cats.keys():
            calculation = Calculation.objects.create(
                start_date=datetime.date.today(),
                end_date=datetime.date.today(),
                category=cat
            )
            process_calculation(calculation.id)

            cnt = CalculationItem.objects.filter(calculation__category=cat).count()
            self.assertEqual(cnt, cats[cat])

            # res, cols = get_detail_result(calculation)
            res, cols = get_category_result(calculation.id)

    def create_service_sequence(self, range=None, state=None, staff=None, price_type=None, price_on_date=None):
        for num in range:
            bs = BaseServiceFactory.create()
            setattr(self, 'bs%s' % num, bs)
            serv = ExtServiceFactory.create(state=state, base_service=bs)
            serv.staff = staff
            serv.save()
            PriceFactory.create(
                on_date=price_on_date,
                extended_service=serv,
                type=price_type
            )

    def test_create_factories(self):
        PriceTypeFactory.create()
        StateFactory.create()
        MedStateFactory.create()
        PriceFactory.create()
        BaseServiceFactory.create()
        ExtServiceFactory.create()
        ReferralFactory.create()
        DepartmentFactory.create()
        StaffFactory.create()
        PositionFactory.create()
        PatientFactory.create()
        ContractTypeFactory.create()
        ContractFactory.create()
        BarcodeFactory.create()
        VisitFactory.create()
        OrderedServiceFactory.create()
        PreorderFactory.create()
        BonusServiceGroupFactory.create()
        BonusRuleFactory.create()
        BonusRuleItemFactory.create()
        BonusRuleItemHistoryFactory.create()


from django.contrib.auth.hashers import make_password
from django.conf import settings


class BonusApiTest(unittest.TestCase):

    def setUp(self):
        """
        """
        self.user = UserFactory.create(password=make_password('api'))
        self.position = PositionFactory.create()
        self.position.staff.user = self.user
        self.position.staff.save()

    def test_bonus_calculation(self):
        client = Client()
        # client.login(username=self.user, password='')
        response = client.post(settings.LOGIN_URL, {'username': self.user.username, 'password': 'api'})
        js = simplejson.loads(response.content)
        self.assertEqual(js['success'], True)
        response = client.get('/api/bonus/calculation')
        self.assertEqual(response.status_code, 200)

    def test_bonus_calculation_item(self):
        client = Client()
        response = client.post(settings.LOGIN_URL, {'username': self.user.username, 'password': 'api'})
        js = simplejson.loads(response.content)
        self.assertEqual(js['success'], True)
        response = client.get('/api/bonus/calculationitem')
        self.assertEqual(response.status_code, 200)
