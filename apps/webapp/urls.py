# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns
from django.contrib.auth.views import logout

urlpatterns = patterns('webapp.views',
    (r'^auth/$', 'auth'),
    (r'^setactiveprofile/(?P<position_id>\d+)/$', 'set_active_profile'),
    (r'^logout/$', logout, {'next_page': '/webapp/auth/'}),
    (r'^cpanel/$', 'cpanel'),
    (r'^(?P<slug>.*)/$', 'viewport'),
)
