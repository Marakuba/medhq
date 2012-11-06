# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class VisitApiTest(unittest.TestCase):

    def test_visit_referral(self):
        client = Client()
        response = client.get('/api/visit/referral')
        self.assertEqual(response.status_code, 200)

    def test_visit_visit(self):
        client = Client()
        response = client.get('/api/visit/visit')
        self.assertEqual(response.status_code, 200)

    def test_visit_refund(self):
        client = Client()
        response = client.get('/api/visit/refund')
        self.assertEqual(response.status_code, 200)

    def test_visit_orderedservice(self):
        client = Client()
        response = client.get('/api/visit/orderedservice')
        self.assertEqual(response.status_code, 200)

    def test_visit_laborderedservice(self):
        client = Client()
        response = client.get('/api/visit/laborderedservice')
        self.assertEqual(response.status_code, 200)

    def test_visit_labservice(self):
        client = Client()
        response = client.get('/api/visit/labservice')
        self.assertEqual(response.status_code, 200)

    def test_visit_labtest(self):
        client = Client()
        response = client.get('/api/visit/labtest')
        self.assertEqual(response.status_code, 200)

    def test_visit_examservice(self):
        client = Client()
        response = client.get('/api/visit/examservice')
        self.assertEqual(response.status_code, 200)

    def test_visit_samplingservice(self):
        client = Client()
        response = client.get('/api/visit/samplingservice')
        self.assertEqual(response.status_code, 200)

    def test_visit_servicebasket(self):
        client = Client()
        response = client.get('/api/visit/servicebasket')
        self.assertEqual(response.status_code, 200)

    def test_visit_refundbasket(self):
        client = Client()
        response = client.get('/api/visit/refundbasket')
        self.assertEqual(response.status_code, 200)

    def test_visit_servicetosend(self):
        client = Client()
        response = client.get('/api/visit/servicetosend')
        self.assertEqual(response.status_code, 200)
