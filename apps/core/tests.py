# -*- coding: utf-8 -*-

"""
"""

from django.utils import unittest
from django.test.client import Client
from django.conf import settings
import imp
import inspect
import factory
from core.models import Unit
from django.contrib.auth.models import User


def autodiscover():
    resources = []
    API_SOURCE_FILE = getattr(settings, 'API_SOURCE_FILE', 'api')
    for app in settings.INSTALLED_APPS:
        try:
            app_path = __import__(app, {}, {}, [app.split('.')[-1]]).__path__
        except AttributeError:
            continue

        try:
            imp.find_module(API_SOURCE_FILE, app_path)
        except ImportError:
            continue
        api_source_file = __import__('%s.%s' % (app, API_SOURCE_FILE))

        classes = inspect.getmembers(api_source_file.api, inspect.isclass)

        for class_name, class_instance in classes:
            if class_name[len(class_name) - 8:] == 'Resource':
                # import pdb; pdb.set_trace()
                try:
                    r = api_source_file.api.__getattribute__(class_name)
                    resource_path = '/api/%s/%s' % (r.Meta.api_name, r.Meta.resource_name)
                    resources.append(resource_path)
                except:
                    pass
    return resources


class UnitFactory(factory.Factory):
    FACTORY_FOR = Unit

    name = factory.Sequence(lambda n: 'unit{0}'.format(n))


class UserFactory(factory.Factory):
    FACTORY_FOR = User

    username = factory.Sequence(lambda n: 'user{0}'.format(n))
    password = '123'
    email = ''


class CoreApiTest(unittest.TestCase):

    # def test_GET(self):
    #     try:
    #         resources = autodiscover()
    #     except:
    #         return
    #     client = Client()
    #     for path in resources:
    #         response = client.get(path)
    #         print response.status_code
    #         print path
    #         self.assertEqual(response.status_code, 200)

    def test_core_contenttype(self):
        client = Client()
        response = client.get('/api/core/contenttype')
        self.assertEqual(response.status_code, 200)

    def test_core_user(self):
        client = Client()
        response = client.get('/api/core/user')
        self.assertEqual(response.status_code, 200)
