# -*- coding: utf-8 -*-

import imp

urls = []


def autodiscover():
    from django.conf import settings
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

        try:
            api = api_source_file.api.api
            urls.extend(api.urls)
        except AttributeError:
            continue

autodiscover()
