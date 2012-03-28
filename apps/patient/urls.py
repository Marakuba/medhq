# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns


urlpatterns = patterns('patient.views',
    (r'^acceptance/(?P<patient_id>\d+)/$', 'acceptancePrint'),
)
