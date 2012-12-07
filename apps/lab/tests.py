# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class LabApiTest(unittest.TestCase):

    def test_service_ls(self):
        client = Client()
        response = client.get('/api/lab/ls')
        self.assertEqual(response.status_code, 200)

    def test_lab_tube(self):
        client = Client()
        response = client.get('/api/lab/tube')
        self.assertEqual(response.status_code, 200)

    def test_lab_analysis(self):
        client = Client()
        response = client.get('/api/lab/analysis')
        self.assertEqual(response.status_code, 200)

    def test_lab_inputlist(self):
        client = Client()
        response = client.get('/api/lab/inputlist')
        self.assertEqual(response.status_code, 200)

    def test_lab_laborder(self):
        client = Client()
        response = client.get('/api/lab/laborder')
        self.assertEqual(response.status_code, 200)

    def test_lab_sampling(self):
        client = Client()
        response = client.get('/api/lab/sampling')
        self.assertEqual(response.status_code, 200)

    def test_lab_bc_sampling(self):
        client = Client()
        response = client.get('/api/lab/bc_sampling')
        self.assertEqual(response.status_code, 200)

    def test_lab_result(self):
        client = Client()
        response = client.get('/api/lab/result')
        self.assertEqual(response.status_code, 200)

    def test_lab_equipment(self):
        client = Client()
        response = client.get('/api/lab/equipment')
        self.assertEqual(response.status_code, 200)

    def test_lab_equipmentassay(self):
        client = Client()
        response = client.get('/api/lab/equipmentassay')
        self.assertEqual(response.status_code, 200)

    def test_lab_equipmenttaskro(self):
        client = Client()
        response = client.get('/api/lab/equipmenttaskro')
        self.assertEqual(response.status_code, 200)

    def test_lab_equipmenttask(self):
        client = Client()
        response = client.get('/api/lab/equipmenttask')
        self.assertEqual(response.status_code, 200)

    def test_lab_equipmentresult(self):
        client = Client()
        response = client.get('/api/lab/equipmentresult')
        self.assertEqual(response.status_code, 200)

    def test_lab_equipmentresultro(self):
        client = Client()
        response = client.get('/api/lab/equipmentresultro')
        self.assertEqual(response.status_code, 200)

    def test_lab_invoice(self):
        client = Client()
        response = client.get('/api/lab/invoice')
        self.assertEqual(response.status_code, 200)

    def test_lab_invoiceitem(self):
        client = Client()
        response = client.get('/api/lab/invoiceitem')
        self.assertEqual(response.status_code, 200)
