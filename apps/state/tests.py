# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class StateApiTest(unittest.TestCase):

    def test_state_lab(self):
        client = Client()
        response = client.get('/api/state/lab')
        self.assertEqual(response.status_code, 200)

    def test_state_medstate(self):
        client = Client()
        response = client.get('/api/state/medstate')
        self.assertEqual(response.status_code, 200)

    def test_state_ownstate(self):
        client = Client()
        response = client.get('/api/state/ownstate')
        self.assertEqual(response.status_code, 200)

    def test_state_state(self):
        client = Client()
        response = client.get('/api/state/state')
        self.assertEqual(response.status_code, 200)

    def test_state_genericstate(self):
        client = Client()
        response = client.get('/api/state/genericstate')
        self.assertEqual(response.status_code, 200)

    def test_state_insurance_state(self):
        client = Client()
        response = client.get('/api/state/insurance_state')
        self.assertEqual(response.status_code, 200)

    def test_state_department(self):
        client = Client()
        response = client.get('/api/state/department')
        self.assertEqual(response.status_code, 200)
