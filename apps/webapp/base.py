# -*- coding: utf-8 -*-

import imp
from django.conf import settings

_registry = {}


def register(xtype):
    def dec(klass):
        _registry[xtype] = klass
        return klass
    return dec


def get_webapp(xtype):
    try:
        return _registry[xtype]
    except KeyError:
        raise Exception("No such webapp '%s'" % xtype)


def all_webapps():
    return _registry.items()


from operator import itemgetter


def all_webapps_choices():
    return sorted([(k, cls.verbose_name or k) \
        for k, cls in _registry.iteritems() \
        if cls.cmp_type in ['action', 'widget']], key=itemgetter(1))


def autodiscover():
    WEBAPP_SOURCE_FILE = getattr(settings, 'WEBAPP_SOURCE_FILE', 'statics')
    for app in settings.INSTALLED_APPS:
        try:
            app_path = __import__(app, {}, {}, [app.split('.')[-1]]).__path__
        except AttributeError:
            continue

        try:
            imp.find_module(WEBAPP_SOURCE_FILE, app_path)
        except ImportError:
            continue
        __import__('%s.%s' % (app, WEBAPP_SOURCE_FILE))
        # print '%s.%s' % (app, WEBAPP_SOURCE_FILE)


class BaseWebApp(object):

    js = []
    css = {}
    depends_on = []
    verbose_name = None
    cmp_type = 'lib'  # possible: action|widget|lib

    def options(self, *args, **kwargs):
        return {}
