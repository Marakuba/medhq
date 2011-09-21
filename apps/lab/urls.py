# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns


urlpatterns = patterns('lab.views',
    (r'^print/results/(?P<object_id>\d+)/$','results'),
    (r'^print/results_by_visit/(?P<visit_id>\d+)/(?P<lab_id>\d+)/$','results_by_visit'),
    (r'^print/invoice/(?P<invoice_id>\d+)/$','print_invoice'),
    (r'^revert_results/$','revert_results'),
    (r'^del_empty_results/$','del_empty_results'),
    (r'^pull_invoice/$','pull_invoice'),
)