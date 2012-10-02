from django.conf.urls.defaults import *

urlpatterns = patterns('oldreporting.views',
    url('^$', 'report_list', name='old-reporting-list'),
    url('^(?P<slug>.*)/print/$', 'print_report', name='old-print-view'),
)
