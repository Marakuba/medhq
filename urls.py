# -*- coding: utf-8 -*-

from django.conf.urls.defaults import *
from django.views.generic.simple import direct_to_template
from django.conf import settings
from django.contrib import admin
from selection.views import selection
from service.models import StandardService, BaseService
from visit.models import Referral
from patient.models import Patient
from django.http import HttpResponseRedirect

handler500 = 'core.views.handler500'

queryset = BaseService.objects.select_related().all().order_by(BaseService._meta.tree_id_attr,
                                                               BaseService._meta.left_attr,
                                                               'level')
selection.register('service', queryset, 'tree', paginate_by=100, template_name="selection/bs_tree.html")

queryset = Referral.objects.all()
selection.register('referral', queryset, 'list', paginate_by=50)

import reporting
import oldreporting
admin.autodiscover()
reporting.autodiscover()
oldreporting.autodiscover()

from autocomplete.views import autocomplete

urlpatterns = patterns('',
    url(r'^$', lambda r: HttpResponseRedirect('/webapp/cpanel/')),
    url(r'^webapp/', include('webapp.urls')),
    url(r'^widget/', include('widget.urls')),
    url(r'^old/reporting/', include('oldreporting.urls')),
    url(r'^reporting/', include('reporting.urls')),
    url(r'^remoting/', include('remoting.urls')),
    url(r'^promotion/', include('promotion.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^admin_tools/', include('admin_tools.urls')),
    url(r'^api/', include('apiutils.urls')),
    url(r'^lab/', include('lab.urls')),
    url(r'^exam/', include('examination.urls')),
    url(r'^visit/', include('visit.urls')),
    url(r'^scheduler/', include('scheduler.urls')),
    url(r'^direct/', include('direct.urls')),
    url(r'^numeration/', include('numeration.urls')),
    url(r'^autocomplete/', include(autocomplete.urls)),
    url(r'^patient/', include('patient.urls')),
    url(r'^accounting/', include('accounting.urls')),
    url(r'^timeslot/haspreorder/(?P<id>\d+)/$', 'scheduler.views.hasPreorder'),
    url(r'^selection/(?P<slc_name>\w+)/$', selection, name='selection'),
)

try:
    from local_urls import localpatterns
    urlpatterns += localpatterns
except:
    print "local urls not found!"
