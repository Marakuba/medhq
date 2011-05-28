from django.conf.urls.defaults import *

urlpatterns = patterns('reporting.views',
    url('^$', 'report_list', name='reporting-list'),
    url('^(?P<slug>.*)/print/$', 'print_report', name='print-view'),
)
