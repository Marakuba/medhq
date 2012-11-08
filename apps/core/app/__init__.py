# -*- coding: utf-8 -*-


import imp


app_pool = {}


class BaseApp(object):
    """
    """

    urls_path = None
    urls_conf = None

    def __init__(self, *args, **kwargs):
        if self.urls:
            print self.urls


def import_urls():
    from django.conf.urls.defaults import include, url
    import urls as root_urls

    for app, cls in app_pool.iteritems():
        urls_conf = cls.urls_conf
        urls_path = cls.urls_path or app
        root_urls.urlpatterns.append(url(r'^%s/' % urls_path, include(urls_conf)))


def autodiscover():
    from django.conf import settings
    APP_SOURCE_FILE = getattr(settings, 'APP_SOURCE_FILE', 'app')
    for app in settings.INSTALLED_APPS:
        try:
            app_path = __import__(app, {}, {}, [app.split('.')[-1]]).__path__
        except AttributeError:
            continue

        try:
            imp.find_module(APP_SOURCE_FILE, app_path)
        except ImportError:
            continue
        app_source_file = __import__('%s.%s' % (app, APP_SOURCE_FILE))

        try:
            application = app_source_file.app.application
            app_pool[app] = application()
        except AttributeError:
            continue

    print app_pool
    import_urls()
    