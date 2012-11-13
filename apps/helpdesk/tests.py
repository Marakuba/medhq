# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class HelpdeskApiTest(unittest.TestCase):

    def test_helpdesk_issue(self):
        client = Client()
        response = client.get('/api/helpdesk/issue')
        self.assertEqual(response.status_code, 200)

    def test_helpdesk_issuetype(self):
        client = Client()
        response = client.get('/api/helpdesk/issuetype')
        self.assertEqual(response.status_code, 200)
