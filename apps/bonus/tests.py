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


class ReferralFactory(factory.Factory):
    FACTORY_FOR = Referral

    operator = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: 'Referral{0}'.format(n))


class StaffFactory(factory.Factory):
    FACTORY_FOR = Staff

    user = factory.SubFactory(UserFactory)
    last_name = factory.Sequence(lambda n: 'Ivan{0}'.format(n))
    first_name = factory.Sequence(lambda n: 'Sokolov{0}'.format(n))
    birth_day = datetime.date(year=random.randint(1948, 1995),
                            month=random.randint(1, 12),
                            day=random.randint(1, 28))
    referral = factory.SubFactory(ReferralFactory)


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
    last_name = factory.Sequence(lambda n: 'Ivan{0}'.format(n))
    first_name = factory.Sequence(lambda n: 'Sokolov{0}'.format(n))
    birth_day = datetime.date(year=random.randint(1948, 1995),
                            month=random.randint(1, 12),
                            day=random.randint(1, 28))


class ContractTypeFactory(factory.Factory):
    FACTORY_FOR = ContractType

    title = factory.Sequence(lambda n: 'ContractType{0}'.format(n))


class ContractFactory(factory.Factory):
    FACTORY_FOR = Contract

    created = datetime.date.today()
    expire = datetime.date.today() + datetime.timedelta(100)
    contract_type = factory.SubFactory(ContractTypeFactory)


class BarcodeFactory(factory.Factory):
    FACTORY_FOR = Barcode


class VisitFactory(factory.Factory):
    FACTORY_FOR = Visit

    operator = factory.SubFactory(UserFactory)
    cls = u'п'
    office = factory.SubFactory(StateFactory)
    patient = factory.SubFactory(PatientFactory)
    referral = factory.SubFactory(ReferralFactory)
    barcode = factory.SubFactory(BarcodeFactory)
    contract = factory.SubFactory(ContractFactory)


class OrderedServiceFactory(factory.Factory):
    FACTORY_FOR = OrderedService

    operator = factory.SubFactory(UserFactory)


class PreorderFactory(factory.Factory):
    FACTORY_FOR = Preorder


class BonusUnitTest(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        pass

    def test_create_factories(self):
        PriceTypeFactory.create()
        StateFactory.create()
        MedStateFactory.create()
        PriceFactory.create()
        BaseServiceFactory.create()
        ExtServiceFactory.create()


class BonusApiTest(unittest.TestCase):

    def test_bonus_calculation(self):
        client = Client()
        response = client.get('/api/bonus/calculation')
        self.assertEqual(response.status_code, 200)
