# -*- coding: utf-8 -*-
from django.conf.urls.defaults import patterns, include

from api.registry import api as registry_api
from api.services import api as services_api


api = registry_api.urls + services_api.urls

urlpatterns = patterns('',
    (r'', include(api)),
)
