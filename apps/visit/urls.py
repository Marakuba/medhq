# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns


urlpatterns = patterns('visit.views',
    (r'^print/visit/(?P<visit_id>\d+)/$','visit'),
    (r'^print/sampling/(?P<visit_id>\d+)/$','sampling'),
)