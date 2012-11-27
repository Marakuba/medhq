# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns


urlpatterns = patterns('service.views',
    (r'^service_tree/$', 'service_tree'),
)
