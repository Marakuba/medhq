# -*- coding: utf-8 -*-

from django.shortcuts import get_object_or_404
import datetime
from django.views.generic.simple import direct_to_template
from visit.models import Visit
from lab.models import Sampling
from django.template import loader
from django.template.context import RequestContext
from django.db.models.aggregates import Sum

def all(request, visit_id):
    visit = get_object_or_404(Visit, pk=visit_id)
    visit.update_total_price()

    patient = visit.patient
    contract = patient.get_contract()
    
    samplings = Sampling.objects.filter(visit=visit)
    
    pages = []
    tubes = {}
    
    os_all = visit.orderedservice_set.all()
    
    for item in os_all:
        s = item.service
        if s.inner_template:
            ctx = {
                'inner_sampling':samplings.filter(tube__in=s.normal_tubes.all())[0],
                'service':item.service
            }
            l = loader.get_template(s.inner_template)
            c = RequestContext(request, ctx)
            t = l.render(c)
            pages.append(t)
            
            
            
    
    extra_context = {
        'patient':patient,
        'contract':contract,
        'samplings':samplings,
        'pages':pages,
        'f':patient.is_f() and u"а" or u"",
        'ff':patient.is_f() and u"на" or u"ен",
        'visit':visit,
        'services':visit.orderedservice_set.all()
    }
    return direct_to_template(request=request, 
                              template='print/visit/all.html', 
                              extra_context=extra_context)

def visit(request, visit_id):
    visit = get_object_or_404(Visit, pk=visit_id)
    visit.update_total_price()

    patient = visit.patient
    contract = patient.get_contract()
    
    extra_context = {
        'patient':patient,
        'contract':contract,
        'f':patient.is_f() and u"а" or u"",
        'ff':patient.is_f() and u"на" or u"ен",
        'visit':visit,
        'services':visit.orderedservice_set.all()
    }
    return direct_to_template(request=request, 
                              template='print/visit/visit.html', 
                              extra_context=extra_context)

def sampling(request, visit_id):
    visit = get_object_or_404(Visit, pk=visit_id)
    visit.generate_laborder()

    patient = visit.patient
    # выводим все пробирки в одной таблице
    samplings = Sampling.objects.filter(visit=visit).order_by('laboratory',)#.exclude(execution_type_group__id=3)
    tubes_count = samplings.aggregate(sum=Sum('tube_count'))
    bc_count = Sampling.objects.filter(visit=visit, laboratory__type='b', is_barcode=False).aggregate(sum=Sum('tube__bc_count'))
    
    extra_context = {
        'patient':patient,
        'visit':visit,
        #'services':visit.orderedservice_set.all(),
        'samplings':samplings,
        'tubes_count':tubes_count,
        'bc_count':bc_count
    }
    return direct_to_template(request=request, 
                              template='print/visit/sampling.html', 
                              extra_context=extra_context)
    