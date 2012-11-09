# -*- coding: utf-8 -*-
from django.conf.urls.defaults import patterns


urlpatterns = patterns('',
    (r'^auth/$', 'webapp.views.auth'),
    (r'^setactiveprofile/(?P<position_id>\d+)/$', 'webapp.views.set_active_profile'),
    (r'^logout/$', 'django.contrib.auth.views.logout', {'next_page': '/webapp/auth/'}),
    (r'^cpanel/$', 'webapp.views.cpanel'),
    (r'^registry/$', 'webapp.views.registry'),


    (r'^barcoding/$', 'webapp.views.barcoding'),
    (r'^testing/$', 'webapp.views.testing'),
    (r'^reporting/$', 'webapp.views.reporting'),
    (r'^laboratory/$', 'webapp.views.laboratory'),
    (r'^examination/$', 'webapp.views.examination'),
    (r'^accounting/$', 'webapp.views.accounting'),
    (r'^helpdesk/$', 'webapp.views.helpdesk'),

    (r'^settings/$', 'webapp.views.js_settings'),

)
