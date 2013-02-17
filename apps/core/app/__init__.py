# -*- coding: utf-8 -*-


import imp


app_pool = {}


class BaseApp(object):
    """
    """

    urls_path = None
    urls_conf = None

    def __init__(self, *args, **kwargs):
        pass
        # if self.urls_conf:
        #     print self.urls_conf

    def callback(self, *args, **kwargs):
        # must be implemented in subclass
        pass


def import_urls():
    from django.conf.urls.defaults import include, url
    app_urls = []
    for app, cls in app_pool.iteritems():
        if not hasattr(cls, 'urls_conf'):
            continue
        urls_conf = cls.urls_conf
        urls_path = cls.urls_path or app
        app_urls.append(url(r'^%s/' % urls_path, include(urls_conf)))

    # print 'urls:', app_urls
    return app_urls


def autodiscover():
    from django.conf import settings
    from .signals import app_load

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
            instance = application()
            app_pool[app] = instance
            instance.callback()
            app_load.send(sender=application, app_label=app)
        except AttributeError:
            continue


urls = import_urls
