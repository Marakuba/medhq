# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class NumerationApiTest(unittest.TestCase):

    def test_numeration_barcode(self):
        client = Client()
        response = client.get('/api/numeration/barcode')
        self.assertEqual(response.status_code, 200)

    def test_numeration_barcodepackage(self):
        client = Client()
        response = client.get('/api/numeration/barcodepackage')
        self.assertEqual(response.status_code, 200)

    def test_numeration_numerator(self):
        client = Client()
        response = client.get('/api/numeration/numerator')
        self.assertEqual(response.status_code, 200)
