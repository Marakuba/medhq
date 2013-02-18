# -*- coding: utf-8 -*-

import imp
from django.conf import settings


def autodiscover():
    EXT_DIRECT_SOURCE_FILE = getattr(settings, 'EXT_DIRECT_SOURCE_FILE', 'extdirects')
    for app in settings.INSTALLED_APPS:
        try:
            app_path = __import__(app, {}, {}, [app.split('.')[-1]]).__path__
        except AttributeError:
            continue

        try:
            imp.find_module(EXT_DIRECT_SOURCE_FILE, app_path)
        except ImportError:
            continue
        __import__('%s.%s' % (app, EXT_DIRECT_SOURCE_FILE))
