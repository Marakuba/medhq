# -*- coding: utf-8 -*-

"""
"""
from annoying.decorators import render_to
from django.shortcuts import get_object_or_404
from examination.models import Template, FieldSet, Card
import simplejson

@render_to('widget/examination/template.html')
def examination_template(request, object_id):
    tpl = get_object_or_404(Template, pk=object_id)
    
    general_data = []
    if tpl.equipment:
        general_data.append({'title':'Оборудование',
                             'text':tpl.equipment.name
                             })
            
    field_sets = dict([(fs.name, fs.title) for fs in FieldSet.objects.all()]) 
    data = tpl.data and simplejson.loads(tpl.data) or []
    for d in data:
        d['title'] = field_sets[d['section']]
    
    ctx = {
        'tpl':tpl,
        'data':data
    }

    return ctx

@render_to('widget/examination/card.html')
def examination_card(request, object_id):
    card = get_object_or_404(Card, pk=object_id)
    general_data = []
    if card.equipment:
        general_data.append({'title':'Оборудование',
                             'text':card.equipment.name
                             })
    if card.mkb_diag:
        general_data.append({'title':'Диагноз по МКБ-10',
                             'text':card.mkb_diag.name
                             })
    field_sets = dict([(fs.name, fs.title) for fs in FieldSet.objects.all()]) 
    data = card.data and simplejson.loads(card.data) or []
    for d in data:
        d['title'] = field_sets[d['section']]
    
    ctx = {
        'card':card,
        'data':data,
        'gdata':general_data
    }

    return ctx