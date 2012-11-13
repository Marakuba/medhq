# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class SchedulerApiTest(unittest.TestCase):

    def test_scheduler_calendar(self):
        client = Client()
        response = client.get('/api/scheduler/calendar')
        self.assertEqual(response.status_code, 200)

    def test_scheduler_rejection_cause(self):
        client = Client()
        response = client.get('/api/scheduler/rejection_cause')
        self.assertEqual(response.status_code, 200)

    def test_scheduler_event(self):
        client = Client()
        response = client.get('/api/scheduler/event')
        self.assertEqual(response.status_code, 200)

    def test_scheduler_preorder(self):
        client = Client()
        response = client.get('/api/scheduler/preorder')
        self.assertEqual(response.status_code, 200)

    def test_scheduler_extpreorder(self):
        client = Client()
        response = client.get('/api/scheduler/extpreorder')
        self.assertEqual(response.status_code, 200)

    def test_scheduler_visitpreorder(self):
        client = Client()
        response = client.get('/api/scheduler/visitpreorder')
        self.assertEqual(response.status_code, 200)
