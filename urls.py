# -*- coding: utf-8 -*-

from autocomplete.views import autocomplete
from django.conf.urls.defaults import *
from django.contrib import admin
from django.http import HttpResponseRedirect

# handler500 = 'core.views.handler500'

admin.autodiscover()

from selection.views import selection

import core.app
core.app.autodiscover()

urlpatterns = patterns('',
    url(r'^$', lambda r: HttpResponseRedirect('/webapp/cpanel/')),
    # url(r'^webapp/', include('webapp.urls')),
    url(r'^widget/', include('widget.urls')),
    # url(r'^old/reporting/', include('oldreporting.urls')),
    # url(r'^reporting/', include('reporting.urls')),
    # url(r'^remoting/', include('remoting.urls')),
    # url(r'^promotion/', include('promotion.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^admin_tools/', include('admin_tools.urls')),
    url(r'^api/', include('api.urls')),
    # url(r'^lab/', include('lab.urls')),
    # url(r'^exam/', include('examination.urls')),
    # url(r'^visit/', include('visit.urls')),
    # url(r'^scheduler/', include('scheduler.urls')),
    url(r'^direct/', include('direct.urls')),
    # url(r'^numeration/', include('numeration.urls')),
    url(r'^autocomplete/', include(autocomplete.urls)),
    # url(r'^patient/', include('patient.urls')),
    # url(r'^accounting/', include('accounting.urls')),
    # url(r'^timeslot/haspreorder/(?P<id>\d+)/$', 'scheduler.views.hasPreorder'),
    url(r'^selection/(?P<slc_name>\w+)/$', selection, name='selection'),
    url(r'', include(core.app.urls()))
)

# try:
#     from local_urls import localpatterns
#     urlpatterns += localpatterns
# except:
#     print "local urls not found!"

from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns += staticfiles_urlpatterns()
