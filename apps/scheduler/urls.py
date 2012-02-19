from django.conf.urls.defaults import *

urlpatterns = patterns('scheduler.views',
    (r'^asgmtlist/$','asgmt_list'),
)