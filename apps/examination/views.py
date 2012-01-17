# -*- coding: utf-8 -*-
from django.template import Context, loader
from django.conf import settings
from examination.models import ExaminationCard, Template, FieldSet, Card
from django.contrib.contenttypes.models import ContentType
from django.views.generic.simple import direct_to_template
import simplejson
from django.db import connection
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render_to_response, get_object_or_404
from annoying.decorators import render_to
from examination.forms import EpicrisisForm
from visit.models import Visit, OrderedService
from django.views.decorators.gzip import gzip_page
from django.core.serializers.json import DjangoJSONEncoder
from lab.models import LabOrder, Result, Analysis

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
    data = tpl.data and simplejson.loads(tpl.data) or []
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

def get_history_tree(request):
    """
    Генерирует дерево в json-формате.
    
    """
    try:
        patient = request.GET.get('patient')
    except:
        return False
    
    tree = []
    
    """cards = Card.objects.filter(ordered_service__order__patient = patient)\
        .order_by('ordered_service__order__id')
    results = Result.objects.filter(order__visit__patient = patient)\
        .order_by('order__visit__id','analysis__service__id')
        
    all_services = {}
    for card in cards:
        if not all_services.has_key(card.ordered_service.order.id):
            all_services[card.ordered_service.order.id] = {'cards':{},'results':{}}
        if not all_services[card.ordered_service.order.id].has_key(card.order.service.id):
            all_services[card.ordered_service.order.id]['cards'][card.order.service.id] = []
        all_services[card.ordered_service.order.id]['cards'][card.order.service.id].append(card)
            
    for result in results:
        if not all_services.has_key(result.order.visit.id):
            all_services[result.order.visit.id] = {'cards':{},'results':{}}
        if not all_services[result.order.visit.id]['results'].has_key(result.analysis.service.id):
            all_services[result.order.visit.id]['results'][result.analysis.service.id] = {}
        if not all_services[result.order.visit.id]['results'][result.analysis.service.id][]
        all_services[result['order__visit__id']]['results'][result['analysis__service__id']].append(result)"""
        
    visit_list = Visit.objects.filter(patient = patient)
    os_list = OrderedService.objects.filter(order__patient = patient)
    cards = Card.objects.filter(ordered_service__order__patient = patient).order_by('ordered_service__order__id')
        
    laborder_list = LabOrder.objects.filter(visit__patient = patient)    
    results = Result.objects.filter(order__visit__patient = patient).order_by('order__visit__id','analysis__service__id')
    
    for visit in visit_list:
        visit_childs = []
        services = os_list.filter(order = visit.id)
        for serv in services:
            order_childs = []
            exams = cards.filter(ordered_service = serv.id)
            for excard in exams:
                exam_node = {
                    "id":"exam%s" % (excard.id),
                    "text":excard.print_name,
                    "date":excard.created,
                    "staff":serv.staff and serv.staff.short_name() or '',
                    "cls":"multi-line-text-node",
                    'singleClickExpand':True,
                    "leaf": True
                }
                order_childs.append(exam_node)
            order_node = {
                "id":"order%s" % (serv.id),
                "text":serv.service.name,
                "date":serv.created,
                "staff":serv.staff and serv.staff.short_name() or '',
                "opetator": visit.operator.first_name,
                "cls":"multi-line-text-node",
                'singleClickExpand':True,
                "children": order_childs,
                "leaf": order_childs and False
            }
            visit_childs.append(order_node)
        lab_orders = laborder_list.filter(visit__id=visit.id)
        for lab in lab_orders:
            laborder_childs = []
            services = [node.analysis.service for node in results]
            services = list(set(services))
            for service in services:
                labservice_node = {
                    "id":"labservice-%s-%s" % (lab.id,service.id),
                    "text":service.name,
                    "cls":"multi-line-text-node",
                    "leaf": True
                }
                laborder_childs.append(labservice_node)
            laborder_node = {
                "id":"laborder%s" % (lab.id),
                "text":"Лабораторный ордер %s" % (lab.id),
                "date":lab.created,
                "cls":"multi-line-text-node",
                'singleClickExpand':True,
                "children": laborder_childs,
                "leaf": laborder_childs and False
            }
            visit_childs.append(laborder_node)
        tree_node = {
            "id":"visit%s" % (visit.id),
            "text":"Прием %s" % (visit.barcode.id),
            "date":visit.created,
            "opetator": visit.operator.first_name,
            "cls":"multi-line-text-node",
            'singleClickExpand':True,
            "children": visit_childs,
            "leaf": visit_childs and False
        }
        tree.append(tree_node)
    
    _result_tree = simplejson.dumps(tree,cls=DjangoJSONEncoder)
    return _result_tree
    
    #doc_type = request.GET.get('nocache')

@gzip_page
def history_tree(request):
    resp = get_history_tree(request)
    cb = request.GET.get('cb')
    if cb:
        resp = u'%s(%s)' % (cb,resp)
    return HttpResponse(resp, mimetype="application/json")
