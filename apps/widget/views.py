# -*- coding: utf-8 -*-

"""
"""
from annoying.decorators import render_to
from django.shortcuts import get_object_or_404
from examination.models import Template, FieldSet
import simplejson

@render_to('widget/examination/template.html')
def examination_template(request, object_id):
    tpl = get_object_or_404(Template, pk=object_id)
        
    field_sets = dict([(fs.name, fs.title) for fs in FieldSet.objects.all()]) 
    data = tpl.data and simplejson.loads(tpl.data) or []
    for d in data:
        d['title'] = field_sets[d['section']]
    
    ctx = {
        'tpl':tpl,
        'data':data
    }

    return ctx