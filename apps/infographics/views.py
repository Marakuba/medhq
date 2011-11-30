# -*- coding: utf-8 -*-

"""
"""

from django.http import HttpResponse
from infographics.cubes import HotTime
from visit.models import Visit
import simplejson
from annoying.decorators import render_to



@render_to('infographics/hot_time.html')
def hot_time(request):
    cube = HotTime(Visit.objects.all())
    dimensions = ['time', 'week_day']
    ctx = cube.table_helper(*dimensions)
    ctx['cube'] = cube
    return ctx