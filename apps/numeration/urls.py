# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns


urlpatterns = patterns('',
    (r'^forvisit/(?P<visit_id>\d+)/$','numeration.views.forvisit'),
    (r'^package/(?P<package_id>\d+)/$','numeration.views.package'),
    (r'^duplicate/(?P<code>\d+)/(?P<count>\d+)/$','numeration.views.duplicate'),
)
