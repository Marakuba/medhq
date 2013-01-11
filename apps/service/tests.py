# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class ServiceApiTest(unittest.TestCase):

    def test_service_baseservice(self):
        client = Client()
        response = client.get('/api/service/baseservice')
        self.assertEqual(response.status_code, 200)

    def test_service_baseservicegroup(self):
        client = Client()
        response = client.get('/api/service/baseservicegroup')
        self.assertEqual(response.status_code, 200)

    def test_service_extendedservice(self):
        client = Client()
        response = client.get('/api/service/extendedservice')
        self.assertEqual(response.status_code, 200)

    def test_service_labgroup(self):
        client = Client()
        response = client.get('/api/service/labgroup')
        self.assertEqual(response.status_code, 200)

    def test_service_icd10(self):
        client = Client()
        response = client.get('/api/service/icd10')
        self.assertEqual(response.status_code, 200)
