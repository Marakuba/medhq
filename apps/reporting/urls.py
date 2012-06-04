from django.conf.urls.defaults import *

urlpatterns = patterns('reporting.views',
    url('^$', 'report_list', name='reporting-list'),
    url('^test/$', 'test_report_list', name='test_reporting-list'),
    url('^(?P<slug>.*)/print/$', 'print_report', name='print-view'),
    url('^(?P<slug>.*)/test_print/$', 'test_print_report', name='print-view'),
)
