# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class PricelistApiTest(unittest.TestCase):

    def test_pricelist_discount(self):
        client = Client()
        response = client.get('/api/pricelist/discount')
        self.assertEqual(response.status_code, 200)
