# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404
from lab.models import LabOrder, Result
from service.models import BaseService
import datetime
from django.views.generic.simple import direct_to_template
import simplejson
from django.http import HttpResponse, HttpResponseBadRequest
from visit.models import OrderedService

def print_results(request, order):
    result_qs = Result.objects.filter(order=order, to_print=True).order_by('analysis__service__%s' % BaseService._meta.tree_id_attr, 
                '-analysis__service__%s' % BaseService._meta.left_attr,
                'analysis__order')
    
    cur_service = None
    cur_group = None
    result_list = []
    set_len = 0
    for result in result_qs:
        if cur_service != result.analysis.service:
            if set_len>1:
                result_list.append({'class':'blank','object':cur_service.gen_ref_interval or ' '})
            cur_service = result.analysis.service
            set_len = cur_service.analysis_set.all().count()
            group = ", ".join([node.__unicode__() for node in cur_service.get_ancestors()]) 
            if cur_group != group:
                cur_group = group
                result_list.append({'class':'group','object':cur_group}) 
            if set_len>1:
                result_list.append({'class':'service','object':cur_service.__unicode__()})
        
        cls = result.is_completed() and 'result' or 'progress'
        result_list.append({'class':cls,'object':result})
            
    if set_len>1:
        result_list.append({'class':'blank','object':cur_service.gen_ref_interval or ' '})

    ec = {
            'order':order,
            'results':result_list
    }
    
    NOW = datetime.datetime.now()
    if order.is_completed and not order.print_date:
        order.is_printed = True
        order.print_date = NOW
        order.save()
        
    services = order.visit.orderedservice_set.filter(executed__isnull=False, print_date__isnull=True)
    services.update(print_date=NOW)
    
    return direct_to_template(request=request, 
                              template="print/lab/results.html",
                              extra_context=ec)


def results(request, object_id):
    """
    """
    
    order = get_object_or_404(LabOrder, pk=object_id)
    return print_results(request, order)

def results_by_visit(request, visit_id, lab_id):
    try:
        order = LabOrder.objects.get(visit__id=visit_id, laboratory__id=lab_id)
        return print_results(request, order)
    except Exception, err:
        return HttpResponseBadRequest(u'некорректный запрос: %s' % err)


def revert_results(request):
    """
    """
    if request.method=='POST':
        lab_order = request.POST.get('order', None)
        ordered_service = request.POST.get('service', None)
        
        if lab_order and ordered_service:
            lab_order = get_object_or_404(LabOrder, id=lab_order)
            ordered_service = get_object_or_404(OrderedService, id=ordered_service)
            c=[]
            for item in ordered_service.service.analysis_set.all():
                result, created = Result.objects.get_or_create(order=lab_order,
                                                               analysis=item, 
                                                               sample=ordered_service.sampling)
                if created:
                    c.append(result)
                    print result
            return HttpResponse(simplejson.dumps({
                                                    'success':True,
                                                    'message':u'Исследования были восстановлены'
                                                }), mimetype='application/json')
    return HttpResponseBadRequest()
    