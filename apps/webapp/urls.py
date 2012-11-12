# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns
from django.contrib.auth.views import logout

urlpatterns = patterns('webapp.views',
    (r'^auth/$', 'auth'),
    (r'^setactiveprofile/(?P<position_id>\d+)/$', 'set_active_profile'),
    (r'^logout/$', logout, {'next_page': '/webapp/auth/'}),
    (r'^cpanel/$', 'cpanel'),
    (r'^(?P<slug>.*)/$', 'viewport'),

    # (r'^registry/$', 'webapp.views.registry'),
    # (r'^barcoding/$', 'webapp.views.barcoding'),
    # (r'^testing/$', 'webapp.views.testing'),
    # (r'^reporting/$', 'webapp.views.reporting'),
    # (r'^laboratory/$', 'webapp.views.laboratory'),
    # (r'^examination/$', 'webapp.views.examination'),
    # (r'^accounting/$', 'webapp.views.accounting'),
    # (r'^helpdesk/$', 'webapp.views.helpdesk'),

    # (r'^settings/$', 'webapp.views.js_settings'),

)
