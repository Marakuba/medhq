# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class ExaminationApiTest(unittest.TestCase):

    def test_examination_exam_equipment(self):
        client = Client()
        response = client.get('/api/examination/exam_equipment')
        self.assertEqual(response.status_code, 200)

    def test_examination_templategroup(self):
        client = Client()
        response = client.get('/api/examination/templategroup')
        self.assertEqual(response.status_code, 200)

    def test_examination_cardtemplate(self):
        client = Client()
        response = client.get('/api/examination/cardtemplate')
        self.assertEqual(response.status_code, 200)

    def test_examination_examcard(self):
        client = Client()
        response = client.get('/api/examination/examcard')
        self.assertEqual(response.status_code, 200)

    def test_examination_card(self):
        client = Client()
        response = client.get('/api/examination/card')
        self.assertEqual(response.status_code, 200)

    def test_examination_examtemplate(self):
        client = Client()
        response = client.get('/api/examination/examtemplate')
        self.assertEqual(response.status_code, 200)

    def test_examination_examfieldset(self):
        client = Client()
        response = client.get('/api/examination/examfieldset')
        self.assertEqual(response.status_code, 200)

    def test_examination_examsubsection(self):
        client = Client()
        response = client.get('/api/examination/examsubsection')
        self.assertEqual(response.status_code, 200)

    def test_examination_glossary(self):
        client = Client()
        response = client.get('/api/examination/glossary')
        self.assertEqual(response.status_code, 200)

    def test_examination_regexamcard(self):
        client = Client()
        response = client.get('/api/examination/regexamcard')
        self.assertEqual(response.status_code, 200)

    def test_examination_dicom(self):
        client = Client()
        response = client.get('/api/examination/dicom')
        self.assertEqual(response.status_code, 200)

    def test_examination_questionnaire(self):
        client = Client()
        response = client.get('/api/examination/questionnaire')
        self.assertEqual(response.status_code, 200)
