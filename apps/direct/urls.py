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
)


import remoting.views
import visit.views
import patient.views
import lab.views
import numeration.views
