from django.conf.urls.defaults import *

from remoting.views import router

urlpatterns = patterns('remoting.views',
    url('^router/$', router),
)
