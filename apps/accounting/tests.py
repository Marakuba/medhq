# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class AccountingApiTest(unittest.TestCase):

    def test_accounting_acc_contract(self):
        client = Client()
        response = client.get('/api/accounting/acc_contract')
        self.assertEqual(response.status_code, 200)

    def test_accounting_acc_invoice(self):
        client = Client()
        response = client.get('/api/accounting/acc_invoice')
        self.assertEqual(response.status_code, 200)

    def test_accounting_acc_invoice_item(self):
        client = Client()
        response = client.get('/api/accounting/acc_invoice_item')
        self.assertEqual(response.status_code, 200)
