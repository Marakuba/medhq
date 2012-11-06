# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class StaffApiTest(unittest.TestCase):

    def test_staff_staff(self):
        client = Client()
        response = client.get('/api/staff/staff')
        self.assertEqual(response.status_code, 200)

    def test_staff_position(self):
        client = Client()
        response = client.get('/api/staff/position')
        self.assertEqual(response.status_code, 200)

    def test_staff_staffsched(self):
        client = Client()
        response = client.get('/api/staff/staffsched')
        self.assertEqual(response.status_code, 200)

    def test_staff_possched(self):
        client = Client()
        response = client.get('/api/staff/possched')
        self.assertEqual(response.status_code, 200)

    def test_staff_doctor(self):
        client = Client()
        response = client.get('/api/staff/doctor')
        self.assertEqual(response.status_code, 200)
