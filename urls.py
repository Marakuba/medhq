# -*- coding: utf-8 -*-

from django.conf.urls.defaults import *
from django.views.generic.simple import direct_to_template

from django.contrib import admin
from selection.views import selection
from service.models import StandardService, BaseService
from patient.models import Patient
from django.http import HttpResponseRedirect

import reporting

admin.autodiscover()
reporting.autodiscover()


from django.conf import settings
from autocomplete.views import autocomplete

queryset = Patient.objects.all()
autocomplete.register(
    id = 'patient',
    queryset = queryset,
    fields = ('id','last_name','first_name'),
    limit = 10,
    label = lambda obj: {'id':obj.id,
                         'label':obj.full_name(),
                         'value':obj.full_name(),
                         'desc':u'PID %s, д.р.: %s' % (obj.zid(),obj.birth_day),
                         'warnings':obj.warnings()}
)

urlpatterns = patterns('',
    url(r'^$', lambda r: HttpResponseRedirect('/webapp/cpanel/')),
    url(r'^webapp/',include('webapp.urls')),
    url(r'^helper/pricelist/$','service.views.price_list_helper'),
    url(r'^helper/servicelist/$','service.views.service_list'),
    url(r'^old/reporting/', include('reporting.urls')),
    url(r'^monitoring/sentry/', include('sentry.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^autocomplete/(\w+)/$', autocomplete, {'query_param':'term'}, name='autocomplete'),
    url(r'^admin_tools/', include('admin_tools.urls')),
    url(r'^api/', include('api.urls')),
    url(r'^lab/', include('lab.urls')),
    url(r'^exam/', include('examination.urls')),
    url(r'^visit/', include('visit.urls')),
    url(r'^numeration/', include('numeration.urls')),
)

urlpatterns += patterns('',
    (r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT, 'show_indexes':True}),
)
