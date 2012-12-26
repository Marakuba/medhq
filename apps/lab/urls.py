# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns


urlpatterns = patterns('lab.views',
    (r'^print/results/(?P<object_id>\d+)/$', 'results'),
    (r'^print/invoice/(?P<invoice_id>\d+)/$', 'print_invoice'),
    (r'^print/register/$', 'print_register'),
    (r'^revert_results/$', 'revert_results'),
    (r'^confirm_results/$', 'confirm_results'),
    (r'^pull_invoice/$', 'pull_invoice'),
    (r'^hem_results/$', 'hem_results'),
    (r'^feed/$', 'feed'),
    (r'^result_loader/$', 'result_loader'),
    (r'^sampling_tree/(?P<visit_id>\d+)/$', 'sampling_tree'),
)
