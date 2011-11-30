# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns, url
from cube.views import table_from_cube
from infographics.cubes import HotTime
from visit.models import Visit


urlpatterns = patterns('infographics.views',
    #(r'^hot_time/$','hot_time'),
    url(r'^hot_time_table/$', table_from_cube, kwargs={
        'cube': HotTime(Visit.objects.all()),
        'dimensions': ['time', 'week_day'],
    }),
    url(r'^hot_time/','hot_time'),
)