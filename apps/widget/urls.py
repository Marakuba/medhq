# -*- coding: utf-8 -*-

"""
"""

# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns


urlpatterns = patterns('widget.views',
    (r'^examination/template/(?P<object_id>\d+)/$', 'examination_template'),
    (r'^examination/card/(?P<object_id>\d+)/$', 'examination_card'),
    (r'^reporting/report/(?P<slug>.*)/$', 'report'),
    (r'^lab/(?P<object_id>\d+)/$', 'lab_results'),
    (r'^lab/manual/(?P<object_id>\d+)/$', 'lab_manuals'),
    (r'^visit/(?P<object_id>\d+)/$', 'visit_preview'),
    
)
