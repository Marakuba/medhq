# -*- coding: utf-8 -*-

"""
"""

# -*- coding: utf-8 -*-

from django.conf.urls.defaults import patterns


urlpatterns = patterns('widget.views',
    (r'^examination/template/(?P<object_id>\d+)/$', 'examination_template'),
    (r'^examination/card/(?P<object_id>\d+)/$', 'examination_card'),
)
