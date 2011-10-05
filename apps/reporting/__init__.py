import imp
from base import *



_registry = {}

def register(slug, klass):
    _registry[slug] = klass

def get_report(slug):
    try:
        return _registry[slug]
    except KeyError:
        raise Exception("No such report '%s'" % slug)

def all_reports():
    return _registry.items()


def autodiscover():
    from django.conf import settings
    CUSTOMS_ROOT = getattr(settings, 'CUSTOMS_ROOT')
    REPORTS_DIR = getattr(settings, 'REPORTS_DIR')
    
    import os

    for dirpath, dirnames, filenames in os.walk(CUSTOMS_ROOT / REPORTS_DIR):
        for filename in filenames:
            if filename.lower().endswith(('.pyc', '__init__.py')): continue

            module = ".".join([REPORTS_DIR, filename.split('.')[0]])
            print module
            __import__("%s" % module)


#    REPORTING_SOURCE_FILE =  getattr(settings, 'REPORTING_SOURCE_FILE', 'reports') 
#    for app in settings.INSTALLED_APPS:
#        try:
#            app_path = __import__(app, {}, {}, [app.split('.')[-1]]).__path__
#        except AttributeError:
#            continue
#
#        print app_path
#
#        try:
#            imp.find_module(REPORTING_SOURCE_FILE, app_path)
#        except ImportError:
#            continue
#        print '%s.%s' % (app, REPORTING_SOURCE_FILE)
#        __import__('%s.%s' % (app, REPORTING_SOURCE_FILE))


def DistinctCount(field):
    from django.db.models import Count
    return Count(field, distinct=True)