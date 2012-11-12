# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class InterlayerApiTest(unittest.TestCase):

    def test_interlayer_clientitem(self):
        client = Client()
        response = client.get('/api/interlayer/clientitem')
        self.assertEqual(response.status_code, 200)
