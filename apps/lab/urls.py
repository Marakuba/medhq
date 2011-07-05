# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns


urlpatterns = patterns('lab.views',
    (r'^print/results/(?P<object_id>\d+)/$','results'),
    (r'^print/results_by_visit/(?P<visit_id>\d+)/(?P<lab_id>\d+)/$','results_by_visit'),
    (r'^revert_results/$','revert_results'),
)