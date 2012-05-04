# -*- coding: utf-8 -*-

"""
"""

from django.conf.urls.defaults import *
from direct import providers

urlpatterns = patterns(
    '',
    (r'^router/$', providers.remote_provider.router),
    (r'^provider.js/$', providers.remote_provider.script),
    (r'^api/$', providers.remote_provider.api),
    (r'^polling/$', providers.polling_provider.router),
    (r'^polling_provider.js/$', providers.polling_provider.script),
)


import core.views
import remoting.views
import visit.views
import patient.views
import lab.views
import numeration.views
import service.views
import staff.views