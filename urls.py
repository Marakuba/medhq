# -*- coding: utf-8 -*-

from django.conf.urls.defaults import *
from django.views.generic.simple import direct_to_template
from django.conf import settings
from django.contrib import admin
from selection.views import selection
from service.models import StandardService, BaseService
from patient.models import Patient
from django.http import HttpResponseRedirect

import reporting
admin.autodiscover()
reporting.autodiscover()

from autocomplete.views import autocomplete

urlpatterns = patterns('',
    url(r'^$', lambda r: HttpResponseRedirect('/webapp/cpanel/')),
    url(r'^webapp/',include('webapp.urls')),
    url(r'^helper/fullpricelist/$','service.views.pricelist'),
    url(r'^helper/pricelist/$','service.views.price_list_helper'),
    url(r'^helper/servicelist/$','service.views.service_list'),
    url(r'^helper/staffsetter/$','service.views.staff_setter'),
    url(r'^old/reporting/', include('reporting.urls')),
    url(r'^monitoring/sentry/', include('sentry.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^admin_tools/', include('admin_tools.urls')),
    url(r'^api/', include('api.urls')),
    url(r'^lab/', include('lab.urls')),
    url(r'^exam/', include('examination.urls')),
    url(r'^visit/', include('visit.urls')),
    url(r'^numeration/', include('numeration.urls')),
    url(r'^autocomplete/', include(autocomplete.urls)),
    #(r'helpdesk/', include('helpdesk.urls')),
)
