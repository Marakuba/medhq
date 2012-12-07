# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client
from pricelist.models import Price, PriceRule, PriceType, get_actual_ptype
from state.models import State
from service.models import BaseService, ExtendedService
import factory
import random
import datetime


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
    priority = random.randint(1, 100)


class StateFactory(factory.Factory):
    FACTORY_FOR = State

    name = factory.Sequence(lambda n: 'state{0}'.format(n))
    price_type = factory.SubFactory(PriceTypeFactory)
    type = 'j'


class MedStateFactory(factory.Factory):
    FACTORY_FOR = State

    name = factory.Sequence(lambda n: 'medstate{0}'.format(n))
    price_type = factory.SubFactory(PriceTypeFactory)
    type = 'm'


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


class PricelistUnitTest(unittest.TestCase):

    def setUp(self):
        # self.gen_pt = PriceTypeFactory.create(name='Основной', priority=11000)
        pass

    def test_create_factories(self):
        PriceTypeFactory.build(priority=111)
        PriceRuleFactory.build(priority=111)
        StateFactory.build()
        MedStateFactory.build()
        PriceFactory.build()
        BaseServiceFactory.build()
        ExtServiceFactory.build()

    def test_get_actual_ptype(self):
        self.evening_pt = PriceTypeFactory.create(name='Будни c 9 вечера до 8 утра')
        self.day_pt = PriceTypeFactory.create(name='Будни c 7 до 21:00')
        self.holiday_pt = PriceTypeFactory.create(name='Выходные')
        self.vip_pt = PriceTypeFactory.create(name='VIP клиенты')
        self.buy_pt = PriceTypeFactory.create(name='Закупочная')
        # PriceRuleFactory.create(price_type=self.gen_pt, priority=0)
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

        self.state = MedStateFactory()
        self.serv1 = ExtServiceFactory.create(state=self.state)

        self.assertEqual(get_actual_ptype(), self.day_pt.id)
        day_07_59 = datetime.datetime(year=2012, month=12, day=6, hour=7, minute=32)
        hol_07_59 = datetime.datetime(year=2012, month=12, day=8, hour=7, minute=32)
        day_23_59 = datetime.datetime(year=2012, month=12, day=6, hour=23, minute=32)
        day_06_59 = datetime.datetime(year=2012, month=12, day=6, hour=6, minute=59)
        day_07_59 = datetime.datetime(year=2012, month=12, day=6, hour=7, minute=59)
        # import pdb; pdb.set_trace()
        self.assertEqual(get_actual_ptype(date=day_07_59), self.day_pt.id)
        self.assertEqual(get_actual_ptype(date=hol_07_59), self.holiday_pt.id)
        self.assertEqual(get_actual_ptype(date=day_23_59), self.evening_pt.id)
        self.assertEqual(get_actual_ptype(date=day_06_59), self.evening_pt.id)
        self.assertEqual(get_actual_ptype(date=day_07_59), self.day_pt.id)
        self.assertEqual(get_actual_ptype(payer=self.payer1.id), self.payer1.price_type.id)
        # self.gen_pr = PriceRule.objects.create(name='Основной')

        nov13 = datetime.datetime(year=2012, month=11, day=13)
        dec26 = datetime.datetime(year=2012, month=12, day=26)

        price1 = PriceFactory.create(extended_service=self.serv1,
                                    type=self.vip_pt,
                                    on_date=datetime.datetime(year=2012, month=12, day=6))

        price2 = PriceFactory.create(extended_service=self.serv1,
                                    type=self.vip_pt,
                                    on_date=datetime.datetime(year=2012, month=11, day=6))
        self.assertEqual(self.serv1.get_actual_price(date=nov13, payer=self.payer1.id), price1.value)
        self.assertEqual(self.serv1.get_actual_price(date=dec26, payer=self.payer1.id), price2.value)

    def test_get_actual_price(self):
        pass


class PricelistApiTest(unittest.TestCase):

    def test_pricelist_discount(self):
        client = Client()
        response = client.get('/api/pricelist/discount')
        self.assertEqual(response.status_code, 200)
