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
    url(r'^widget/',include('widget.urls')),
    url(r'^old/reporting/', include('reporting.urls')),
    url(r'^remoting/', include('remoting.urls')),
    url(r'^promotion/', include('promotion.urls')),
#    url(r'^monitoring/sentry/', include('sentry.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^admin_tools/', include('admin_tools.urls')),
    url(r'^api/', include('api.urls')),
    url(r'^lab/', include('lab.urls')),
    url(r'^exam/', include('examination.urls')),
    url(r'^visit/', include('visit.urls')),
    url(r'^scheduler/', include('scheduler.urls')),
    url(r'^direct/', include('direct.urls')),
    url(r'^numeration/', include('numeration.urls')),
    url(r'^autocomplete/', include(autocomplete.urls)),
    url(r'^patient/', include('patient.urls')),
    url(r'^timeslot/haspreorder/(?P<id>\d+)/$', 'scheduler.views.hasPreorder'),
)

try:
    from local_urls import localpatterns
    urlpatterns += localpatterns
except:
    print "local urls not found!"
