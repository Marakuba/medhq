# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class MedstandartApiTest(unittest.TestCase):

    def test_medstandart_nosological_form(self):
        client = Client()
        response = client.get('/api/medstandart/nosological_form')
        self.assertEqual(response.status_code, 200)

    def test_medstandart_age_category(self):
        client = Client()
        response = client.get('/api/medstandart/age_category')
        self.assertEqual(response.status_code, 200)

    def test_medstandart_phase(self):
        client = Client()
        response = client.get('/api/medstandart/phase')
        self.assertEqual(response.status_code, 200)

    def test_medstandart_stage(self):
        client = Client()
        response = client.get('/api/medstandart/stage')
        self.assertEqual(response.status_code, 200)

    def test_medstandart_complications(self):
        client = Client()
        response = client.get('/api/medstandart/complications')
        self.assertEqual(response.status_code, 200)

    def test_medstandart_term(self):
        client = Client()
        response = client.get('/api/medstandart/term')
        self.assertEqual(response.status_code, 200)

    def test_medstandart_medstandart(self):
        client = Client()
        response = client.get('/api/medstandart/medstandart')
        self.assertEqual(response.status_code, 200)

    def test_medstandart_standartitem(self):
        client = Client()
        response = client.get('/api/medstandart/standartitem')
        self.assertEqual(response.status_code, 200)
