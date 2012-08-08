import imp
from base import *



_registry = {}

def register(slug):
    def dec(klass):
        _registry[slug] = klass
        return klass
    return dec

def get_report(slug):
    try:
        return _registry[slug]
    except KeyError:
        raise Exception("No such report '%s'" % slug)

def all_reports():
    return _registry.items()


def autodiscover():
    from django.conf import settings
    REPORTING_SOURCE_FILE =  getattr(settings, 'REPORTING_SOURCE_FILE', 'reports') 
    for app in settings.INSTALLED_APPS:
        try:
            app_path = __import__(app, {}, {}, [app.split('.')[-1]]).__path__
        except AttributeError:
            continue

        try:
            imp.find_module(REPORTING_SOURCE_FILE, app_path)
        except ImportError:
            continue
        __import__('%s.%s' % (app, REPORTING_SOURCE_FILE))
        print '%s.%s' % (app, REPORTING_SOURCE_FILE)
#    REPORTS_DIR = 'reports'
#    CUSTOM_APPS = settings.CUSTOM_APPS
#    print CUSTOM_APPS / REPORTS_DIR
#    import os
#
#    for dirpath, dirnames, filenames in os.walk(CUSTOM_APPS / REPORTS_DIR):
#        for filename in filenames:
#            if filename.lower().endswith(('.pyc', '__init__.py')): continue
#
#            module = ".".join([REPORTS_DIR, filename.split('.')[0]])
#            print module
#            __import__("%s" % module)


def DistinctCount(field):
    from django.db.models import Count
    return Count(field, distinct=True)