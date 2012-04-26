# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns


urlpatterns = patterns('examination.views',
    (r'^examcard/(?P<card_id>\d+)/$', 'examcard'),
    (r'^card/(?P<object_id>\d+)/$', 'card'),
    (r'^template_preview/(?P<tpl_id>\d+)/$', 'template_preview'),
    (r'^epicrisis/$', 'epicrisis'),
    (r'^history_tree/$','history_tree'),
)
