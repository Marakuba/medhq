# -*- coding: utf-8 -*-


from django.conf.urls.defaults import patterns


urlpatterns = patterns('bonus.views',
    (r'^allcards/(?P<calculation_id>\d+)/$', 'allcards'),
    (r'^card/(?P<calculation_id>\d+)/(?P<referral_id>\d+)/$', 'card'),
)
