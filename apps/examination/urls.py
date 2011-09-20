# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns


urlpatterns = patterns('examination.views',
    (r'^card/(?P<card_id>\d+)/$', 'cardPrint'),
    (r'^epicrisis/$', 'epicrisis'),
)
