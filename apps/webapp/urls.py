# -*- coding: utf-8 -*-
from django.conf.urls.defaults import patterns, include
from django.views.generic.simple import direct_to_template


urlpatterns = patterns('',
    (r'^auth/$','webapp.views.auth'),
    (r'^setactiveprofile/(?P<position_id>\d+)/$','webapp.views.set_active_profile'),
    (r'^logout/$','django.contrib.auth.views.logout', {'next_page':'/webapp/auth/'}),
    (r'^cpanel/$','webapp.views.cpanel'),
    (r'^registry/$','webapp.views.registry'),
    (r'^service/$','webapp.views.service'),
    (r'^service_tree/$','webapp.views.service_tree'),
    (r'^service/children/((?P<parent_id>\d+)/)?$','webapp.views.children'),
    (r'^sampling_tree/(?P<visit_id>\d+)/$','webapp.views.sampling_tree'),

    (r'^barcode/$','webapp.views.barcodeimg'),
    (r'^service/groups/$','webapp.views.groups'),
    (r'^testing/$','webapp.views.testing'),
    (r'^reporting/$','webapp.views.reporting'),
    (r'^laboratory/$','webapp.views.laboratory'),
    (r'^examination/$','webapp.views.examination'),
    (r'^helpdesk/$','webapp.views.helpdesk'),    
)
