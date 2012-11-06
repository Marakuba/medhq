# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class CrmApiTest(unittest.TestCase):

    def test_crm_adsource(self):
        client = Client()
        response = client.get('/api/crm/adsource')
        self.assertEqual(response.status_code, 200)
