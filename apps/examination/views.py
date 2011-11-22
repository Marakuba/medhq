# -*- coding: utf-8 -*-
from django.template import Context, loader
from django.conf import settings
from examination.models import ExaminationCard, Template, FieldSet
from django.contrib.contenttypes.models import ContentType
from django.views.generic.simple import direct_to_template
import simplejson
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render_to_response, get_object_or_404
from annoying.decorators import render_to
from examination.forms import EpicrisisForm

def cardPrint(request,card_id):
    card = get_object_or_404(ExaminationCard, pk=card_id)
    to_print = card.comment.split(',')
    ec = {
            'card':card,
            'to_print':to_print
    }
    return direct_to_template(request=request, 
                              template="print/exam/exam_card.html",
                              extra_context=ec)


@render_to('print/exam/template_preview.html')
def template_preview(request, tpl_id):
    tpl = get_object_or_404(Template, pk=tpl_id)
    
    field_sets = dict([(fs.name, fs.title) for fs in FieldSet.objects.all()]) 
    data = simplejson.loads(tpl.data)
    for d in data:
        d['title'] = field_sets[d['section']]
    
    ctx = {
        'tpl':tpl,
        'data':data
    }
    return ctx
    

@render_to('print/exam/epicrisis.html')
def epicrisis(request):
    """
    """
    if request.method=='POST':
        form = EpicrisisForm(request.POST)
        if form.is_valid():
            patient = form.cleaned_data['patient']
            cards = ExaminationCard.objects.filter(ordered_service__order__patient=patient,
                                                   created__range=(form.cleaned_data['start_date'],form.cleaned_data['end_date']))
    
            return {
                'patient':patient,
                'cards':cards
            }
        return HttpResponseBadRequest('Form is not valid')
        
    return HttpResponseBadRequest('Incorrect method')