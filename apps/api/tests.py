# -*- coding: utf-8 -*-

"""
"""

from django.utils import unittest
from django.test.client import Client

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
    
    def test_patient(self):
        client = Client()
        response = client.get('/api/v1/dashboard/patient')
        self.assertEqual(response.status_code, 200)
    
    def test_debtor(self):
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
    
    def test_position(self):
        client = Client()
        response = client.get('/api/v1/dashboard/position')
        self.assertEqual(response.status_code, 200)
    
    def test_staff(self):
        client = Client()
        response = client.get('/api/v1/dashboard/staff')
        self.assertEqual(response.status_code, 200)
    
    def test_doctor(self):
        client = Client()
        response = client.get('/api/v1/dashboard/doctor')
        self.assertEqual(response.status_code, 200)
    
    def test_staffsched(self):
        client = Client()
        response = client.get('/api/v1/dashboard/staffsched')
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
    
    def test_equipmenttask(self):
        client = Client()
        response = client.get('/api/v1/dashboard/equipmenttask')
        self.assertEqual(response.status_code, 200)
    
    def test_equipmentresult(self):
        client = Client()
        response = client.get('/api/v1/dashboard/equipmentresult')
        self.assertEqual(response.status_code, 200)
    
    def test_calendar(self):
        client = Client()
        response = client.get('/api/v1/dashboard/calendar')
        self.assertEqual(response.status_code, 200)
    
    def test_preorder(self):
        client = Client()
        response = client.get('/api/v1/dashboard/preorder')
        self.assertEqual(response.status_code, 200)
    
    def test_preorderedservice(self):
        client = Client()
        response = client.get('/api/v1/dashboard/preorderedservice')
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
    
