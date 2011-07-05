# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns


urlpatterns = patterns('',
    (r'^card/(?P<card_id>\d+)/$', 'examination.views.cardPrint'),
)
