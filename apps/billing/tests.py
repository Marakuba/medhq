# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client
from django.test import TestCase


class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        self.failUnlessEqual(1 + 1, 2)

__test__ = {"doctest": """
Another way to test that 1 + 1 is equal to 2.

>>> 1 + 1 == 2
True
"""}


class BillingApiTest(unittest.TestCase):

    def test_billing_account(self):
        client = Client()
        response = client.get('/api/billing/account')
        self.assertEqual(response.status_code, 200)

    def test_billing_clientaccount(self):
        client = Client()
        response = client.get('/api/billing/clientaccount')
        self.assertEqual(response.status_code, 200)

    def test_billing_payment(self):
        client = Client()
        response = client.get('/api/billing/payment')
        self.assertEqual(response.status_code, 200)
