# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class PatientApiTest(unittest.TestCase):

    def test_patient_patient(self):
        client = Client()
        response = client.get('/api/patient/patient')
        self.assertEqual(response.status_code, 200)

    def test_patient_insurance_policy(self):
        client = Client()
        response = client.get('/api/patient/insurance_policy')
        self.assertEqual(response.status_code, 200)

    def test_patient_contracttype(self):
        client = Client()
        response = client.get('/api/patient/contracttype')
        self.assertEqual(response.status_code, 200)

    def test_patient_contract(self):
        client = Client()
        response = client.get('/api/patient/contract')
        self.assertEqual(response.status_code, 200)

    def test_patient_debtor(self):
        client = Client()
        response = client.get('/api/patient/debtor')
        self.assertEqual(response.status_code, 200)

    def test_patient_depositor(self):
        client = Client()
        response = client.get('/api/patient/depositor')
        self.assertEqual(response.status_code, 200)
