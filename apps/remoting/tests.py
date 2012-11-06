# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client


class RemotingApiTest(unittest.TestCase):

    def test_remoting_remotestate(self):
        client = Client()
        response = client.get('/api/remoting/remotestate')
        self.assertEqual(response.status_code, 200)
