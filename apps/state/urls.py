# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns


urlpatterns = patterns('accounting.views',
    (r'^invoice/print/(?P<invoice_id>\d+)/$','invoice'),
)
