# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class ReportingApiTest(unittest.TestCase):

    def test_reporting_reporttree(self):
        client = Client()
        response = client.get('/api/reporting/reporttree')
        self.assertEqual(response.status_code, 200)

    def test_reporting_sqlquery(self):
        client = Client()
        response = client.get('/api/reporting/sqlquery')
        self.assertEqual(response.status_code, 200)

    def test_reporting_report(self):
        client = Client()
        response = client.get('/api/reporting/report')
        self.assertEqual(response.status_code, 200)
