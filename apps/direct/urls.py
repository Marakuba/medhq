# -*- coding: utf-8 -*-

"""
"""

from django.conf.urls.defaults import patterns
from direct import providers

urlpatterns = patterns(
    '',
    (r'^router/$', providers.remote_provider.router),
    (r'^provider.js/$', providers.remote_provider.script),
    (r'^api/$', providers.remote_provider.api),
    (r'^polling/$', providers.polling_provider.router),
    (r'^polling_provider.js/$', providers.polling_provider.script),
)
