# -*- coding: utf-8 -*-

"""
"""

from django.utils import unittest
from django.test.client import Client
from django.conf import settings
import imp
import datetime
import inspect


def autodiscover():
    resources = []
    API_SOURCE_FILE = getattr(settings, 'API_SOURCE_FILE', 'api')
    for app in settings.INSTALLED_APPS:
        try:
            app_path = __import__(app, {}, {}, [app.split('.')[-1]]).__path__
        except AttributeError:
            continue

        try:
            imp.find_module(API_SOURCE_FILE, app_path)
        except ImportError:
            continue
        api_source_file = __import__('%s.%s' % (app, API_SOURCE_FILE))

        classes = inspect.getmembers(api_source_file.api, inspect.isclass)

        for class_name, class_instance in classes:
            if class_name[len(class_name) - 8:] == 'Resource':
                r = api_source_file.api.__getattribute__(class_name)
                resource_path = '/api/%s/%s' % (r.Meta.api_name, r.Meta.resource_name)
                resources.extend(resource_path)
    return resources


class AllApiTest(unittest.TestCase):

    def get_test(self):
        resources = autodiscover()
        client = Client()
        for path in resources:
            response = client.get(path)
            self.assertEqual(response.status_code, 200)


class ApiTest(unittest.TestCase):

    def test_icd10(self):
        client = Client()
        response = client.get('/api/v1/dashboard/icd10')
        self.assertEqual(response.status_code, 200)

    def test_discount(self):
        client = Client()
        response = client.get('/api/v1/dashboard/discount')
        self.assertEqual(response.status_code, 200)

    def test_clientitem(self):
        client = Client()
        response = client.get('/api/v1/dashboard/clientitem')
        self.assertEqual(response.status_code, 200)

    def test_adsource(self):
        client = Client()
        response = client.get('/api/v1/dashboard/adsource')
        self.assertEqual(response.status_code, 200)

    def test_patient_read(self):
        client = Client()
        response = client.get('/api/v1/dashboard/patient')
        self.assertEqual(response.status_code, 200)

    def test_contracttype(self):
        client = Client()
        response = client.get('/api/v1/dashboard/contracttype')
        self.assertEqual(response.status_code, 200)

    def test_contract(self):
        client = Client()
        response = client.get('/api/v1/dashboard/contract')
        self.assertEqual(response.status_code, 200)

#    def test_patient_create(self):
#        client = Client()
#
#        LAST_NAME = u'Смит'
#        FIRST_NAME = u'Джон'
#        MID_NAME = u'К'
#        BIRTH_DAY = datetime.date.today().strftime('%Y-%m-%dT%H:%m:%s')
#        GENDER = u'М'
#        MOBILE_PHONE = '112'
#        EMAIL = u'john.k.smith@medhq.ru'
#        INITIAL_ACCOUNT = 100
#        HOME_ADDRESS_STREET = u'Цветочный бульвар, 15'
#
#        data = {
#            'format':'json',
#            'objects':{
#                'last_name':LAST_NAME,
#                'first_name':FIRST_NAME,
#                'mid_name':MID_NAME,
#                'birth_day':BIRTH_DAY,
#                'gender':GENDER,
#                'mobile_phone':MOBILE_PHONE,
#                'email':EMAIL,
#                'initial_account':INITIAL_ACCOUNT,
#                'home_address_street':HOME_ADDRESS_STREET
#            }
#        }
#        response = client.post('/api/v1/dashboard/patient')
#        self.assertEqual(response.status_code, 200)

    def test_debtor(self):
        client = Client()
        response = client.get('/api/v1/dashboard/depositor')
        self.assertEqual(response.status_code, 200)

    def test_depositor(self):
        client = Client()
        response = client.get('/api/v1/dashboard/debtor')
        self.assertEqual(response.status_code, 200)

    def test_referral(self):
        client = Client()
        response = client.get('/api/v1/dashboard/referral')
        self.assertEqual(response.status_code, 200)

    def test_lab(self):
        client = Client()
        response = client.get('/api/v1/dashboard/lab')
        self.assertEqual(response.status_code, 200)

    def test_medstate(self):
        client = Client()
        response = client.get('/api/v1/dashboard/medstate')
        self.assertEqual(response.status_code, 200)

    def test_remotestate(self):
        client = Client()
        response = client.get('/api/v1/dashboard/remotestate')
        self.assertEqual(response.status_code, 200)

    def test_ownstate(self):
        client = Client()
        response = client.get('/api/v1/dashboard/ownstate')
        self.assertEqual(response.status_code, 200)

    def test_state(self):
        client = Client()
        response = client.get('/api/v1/dashboard/state')
        self.assertEqual(response.status_code, 200)

    def test_labgroup(self):
        client = Client()
        response = client.get('/api/v1/dashboard/labgroup')
        self.assertEqual(response.status_code, 200)

    def test_insurance_state(self):
        client = Client()
        response = client.get('/api/v1/dashboard/insurance_state')
        self.assertEqual(response.status_code, 200)

    def test_insurance_policy(self):
        client = Client()
        response = client.get('/api/v1/dashboard/insurance_policy')
        self.assertEqual(response.status_code, 200)

    def test_barcode(self):
        client = Client()
        response = client.get('/api/v1/dashboard/barcode')
        self.assertEqual(response.status_code, 200)

    def test_visit(self):
        client = Client()
        response = client.get('/api/v1/dashboard/visit')
        self.assertEqual(response.status_code, 200)

    def test_refund(self):
        client = Client()
        response = client.get('/api/v1/dashboard/refund')
        self.assertEqual(response.status_code, 200)

    def test_laborder(self):
        client = Client()
        response = client.get('/api/v1/dashboard/laborder')
        self.assertEqual(response.status_code, 200)

    def test_baseservice(self):
        client = Client()
        response = client.get('/api/v1/dashboard/baseservice')
        self.assertEqual(response.status_code, 200)

    def test_staff(self):
        client = Client()
        response = client.get('/api/v1/dashboard/staff')
        self.assertEqual(response.status_code, 200)

    def test_position(self):
        client = Client()
        response = client.get('/api/v1/dashboard/position')
        self.assertEqual(response.status_code, 200)

    def test_extendedservice(self):
        client = Client()
        response = client.get('/api/v1/dashboard/extendedservice')
        self.assertEqual(response.status_code, 200)

    def test_analysis(self):
        client = Client()
        response = client.get('/api/v1/dashboard/analysis')
        self.assertEqual(response.status_code, 200)

    def test_result(self):
        client = Client()
        response = client.get('/api/v1/dashboard/result')
        self.assertEqual(response.status_code, 200)

    def test_inputlist(self):
        client = Client()
        response = client.get('/api/v1/dashboard/inputlist')
        self.assertEqual(response.status_code, 200)

    def test_doctor(self):
        client = Client()
        response = client.get('/api/v1/dashboard/doctor')
        self.assertEqual(response.status_code, 200)

    def test_staffsched(self):
        client = Client()
        response = client.get('/api/v1/dashboard/staffsched')
        self.assertEqual(response.status_code, 200)

    def test_department(self):
        client = Client()
        response = client.get('/api/v1/dashboard/department')
        self.assertEqual(response.status_code, 200)

    def test_possched(self):
        client = Client()
        response = client.get('/api/v1/dashboard/possched')
        self.assertEqual(response.status_code, 200)

    def test_tube(self):
        client = Client()
        response = client.get('/api/v1/dashboard/tube')
        self.assertEqual(response.status_code, 200)

    def test_numerator(self):
        client = Client()
        response = client.get('/api/v1/dashboard/numerator')
        self.assertEqual(response.status_code, 200)

    def test_sampling(self):
        client = Client()
        response = client.get('/api/v1/dashboard/sampling')
        self.assertEqual(response.status_code, 200)

    def test_bc_sampling(self):
        client = Client()
        response = client.get('/api/v1/dashboard/bc_sampling')
        self.assertEqual(response.status_code, 200)

    def test_orderedservice(self):
        client = Client()
        response = client.get('/api/v1/dashboard/orderedservice')
        self.assertEqual(response.status_code, 200)

    def test_laborderedservice(self):
        client = Client()
        response = client.get('/api/v1/dashboard/laborderedservice')
        self.assertEqual(response.status_code, 200)

    def test_labservice(self):
        client = Client()
        response = client.get('/api/v1/dashboard/labservice')
        self.assertEqual(response.status_code, 200)

    def test_labtest(self):
        client = Client()
        response = client.get('/api/v1/dashboard/labtest')
        self.assertEqual(response.status_code, 200)

    def test_examservice(self):
        client = Client()
        response = client.get('/api/v1/dashboard/examservice')
        self.assertEqual(response.status_code, 200)

    def test_samplingservice(self):
        client = Client()
        response = client.get('/api/v1/dashboard/samplingservice')
        self.assertEqual(response.status_code, 200)

    def test_servicebasket(self):
        client = Client()
        response = client.get('/api/v1/dashboard/servicebasket')
        self.assertEqual(response.status_code, 200)

    def test_refundbasket(self):
        client = Client()
        response = client.get('/api/v1/dashboard/refundbasket')
        self.assertEqual(response.status_code, 200)

    def test_barcodepackage(self):
        client = Client()
        response = client.get('/api/v1/dashboard/barcodepackage')
        self.assertEqual(response.status_code, 200)

    def test_exam_equipment(self):
        client = Client()
        response = client.get('/api/v1/dashboard/exam_equipment')
        self.assertEqual(response.status_code, 200)

    def test_templategroup(self):
        client = Client()
        response = client.get('/api/v1/dashboard/templategroup')
        self.assertEqual(response.status_code, 200)

    def test_cardtemplate(self):
        client = Client()
        response = client.get('/api/v1/dashboard/cardtemplate')
        self.assertEqual(response.status_code, 200)

    def test_examcard(self):
        client = Client()
        response = client.get('/api/v1/dashboard/examcard')
        self.assertEqual(response.status_code, 200)

    def test_card(self):
        client = Client()
        response = client.get('/api/v1/dashboard/card')
        self.assertEqual(response.status_code, 200)

    def test_examtemplate(self):
        client = Client()
        response = client.get('/api/v1/dashboard/examtemplate')
        self.assertEqual(response.status_code, 200)

    def test_examfieldset(self):
        client = Client()
        response = client.get('/api/v1/dashboard/examfieldset')
        self.assertEqual(response.status_code, 200)

    def test_examsubsection(self):
        client = Client()
        response = client.get('/api/v1/dashboard/examsubsection')
        self.assertEqual(response.status_code, 200)

    def test_glossary(self):
        client = Client()
        response = client.get('/api/v1/dashboard/glossary')
        self.assertEqual(response.status_code, 200)

    def test_regexamcard(self):
        client = Client()
        response = client.get('/api/v1/dashboard/regexamcard')
        self.assertEqual(response.status_code, 200)

    def test_dicom(self):
        client = Client()
        response = client.get('/api/v1/dashboard/dicom')
        self.assertEqual(response.status_code, 200)

    def test_equipment(self):
        client = Client()
        response = client.get('/api/v1/dashboard/equipment')
        self.assertEqual(response.status_code, 200)

    def test_equipmentassay(self):
        client = Client()
        response = client.get('/api/v1/dashboard/equipmentassay')
        self.assertEqual(response.status_code, 200)

    def test_equipmenttaskro(self):
        client = Client()
        response = client.get('/api/v1/dashboard/equipmenttaskro')
        self.assertEqual(response.status_code, 200)

    def test_equipmenttask(self):
        client = Client()
        response = client.get('/api/v1/dashboard/equipmenttask')
        self.assertEqual(response.status_code, 200)

    def test_equipmentresult(self):
        client = Client()
        response = client.get('/api/v1/dashboard/equipmentresult')
        self.assertEqual(response.status_code, 200)

    def test_equipmentresultro(self):
        client = Client()
        response = client.get('/api/v1/dashboard/equipmentresultro')
        self.assertEqual(response.status_code, 200)

    def test_promotion(self):
        client = Client()
        response = client.get('/api/v1/dashboard/promotion')
        self.assertEqual(response.status_code, 200)

    def test_calendar(self):
        client = Client()
        response = client.get('/api/v1/dashboard/calendar')
        self.assertEqual(response.status_code, 200)

    def test_preorder(self):
        client = Client()
        response = client.get('/api/v1/dashboard/preorder')
        self.assertEqual(response.status_code, 200)

    def test_extpreorder(self):
        client = Client()
        response = client.get('/api/v1/dashboard/extpreorder')
        self.assertEqual(response.status_code, 200)

    def test_visitpreorder(self):
        client = Client()
        response = client.get('/api/v1/dashboard/visitpreorder')
        self.assertEqual(response.status_code, 200)

    def test_event(self):
        client = Client()
        response = client.get('/api/v1/dashboard/event')
        self.assertEqual(response.status_code, 200)

    def test_issuetype(self):
        client = Client()
        response = client.get('/api/v1/dashboard/issuetype')
        self.assertEqual(response.status_code, 200)

    def test_issue(self):
        client = Client()
        response = client.get('/api/v1/dashboard/issue')
        self.assertEqual(response.status_code, 200)

    def test_contenttype(self):
        client = Client()
        response = client.get('/api/v1/dashboard/contenttype')
        self.assertEqual(response.status_code, 200)

    def test_account(self):
        client = Client()
        response = client.get('/api/v1/dashboard/account')
        self.assertEqual(response.status_code, 200)

    def test_clientaccount(self):
        client = Client()
        response = client.get('/api/v1/dashboard/clientaccount')
        self.assertEqual(response.status_code, 200)

    def test_payment(self):
        client = Client()
        response = client.get('/api/v1/dashboard/payment')
        self.assertEqual(response.status_code, 200)

    def test_invoice(self):
        client = Client()
        response = client.get('/api/v1/dashboard/invoice')
        self.assertEqual(response.status_code, 200)

    def test_invoiceitem(self):
        client = Client()
        response = client.get('/api/v1/dashboard/invoiceitem')
        self.assertEqual(response.status_code, 200)

    def test_servicetosend(self):
        client = Client()
        response = client.get('/api/v1/dashboard/servicetosend')
        self.assertEqual(response.status_code, 200)

