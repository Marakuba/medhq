# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class PromotionApiTest(unittest.TestCase):

    def test_promotion_promotion(self):
        client = Client()
        response = client.get('/api/promotion/promotion')
        self.assertEqual(response.status_code, 200)
