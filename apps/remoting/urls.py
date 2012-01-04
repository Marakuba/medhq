from django.conf.urls.defaults import *

urlpatterns = patterns('remoting.views',
    url('^send/$', 'send'),
    url('^recieve/$', 'recieve'),
)
