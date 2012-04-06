# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns


urlpatterns = patterns('visit.views',
    (r'^print/visit/(?P<visit_id>\d+)/$','visit'),
    (r'^print/lab_agreement/(?P<visit_id>\d+)/$','lab_agreement'),
    (r'^print/custom_blank/$','custom_blank'),
    (r'^print/sampling/(?P<visit_id>\d+)/$','sampling'),
    (r'^daily_staff_report/$','daily_staff_report'),
)