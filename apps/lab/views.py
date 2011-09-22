# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404
from lab.models import LabOrder, Result, Invoice, InvoiceItem, Sampling
from service.models import BaseService
import datetime
from django.views.generic.simple import direct_to_template
import simplejson
from django.http import HttpResponse, HttpResponseBadRequest
from visit.models import OrderedService
from state.models import State
from annoying.decorators import render_to
from django.db.models.aggregates import Count

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
    
    preview = request.GET.get('preview')
    
    if not preview:
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
        lab_order = request.POST.get('laborder', None)
        
        if lab_order:
            lab_order = get_object_or_404(LabOrder, id=lab_order)
            ordered_services = lab_order.visit.orderedservice_set.all()
            for ordered_service in ordered_services:
                for item in ordered_service.service.analysis_set.all():
                    result, created = Result.objects.get_or_create(order=lab_order,
                                                                   analysis=item, 
                                                                   sample=ordered_service.sampling)
            return HttpResponse(simplejson.dumps({
                                                    'success':True,
                                                    'message':u'Исследования были восстановлены'
                                                }), mimetype='application/json')
    return HttpResponseBadRequest()
    

def confirm_results(request):
    """
    """
    if request.method=='POST':
        lab_order = request.POST.get('order', None)
        if lab_order:
            lab_order = get_object_or_404(LabOrder, id=lab_order)
            Result.objects.filter(order=lab_order, validation=0).delete()
            Result.objects.filter(order=lab_order, validation=-1).update(validation=1)
            lab_order.is_completed = True
            for result in lab_order.result_set.all():
                if not result.is_completed():
                    lab_order.is_completed = False
                    break
            lab_order.save()
            msg = lab_order.is_completed and u'Лабораторный ордер подтвержден' or u'Присутствуют пустые значения. Лабораторный ордер не подтвержден'
            return HttpResponse(simplejson.dumps({
                                                    'success':lab_order.is_completed,
                                                    'message':msg
                                                }), mimetype='application/json')
    return HttpResponseBadRequest()
    

def pull_invoice(request):
    """
    """
    if request.method=='POST':
        invoice_id = request.POST.get('invoice',None)
        state_id = request.POST.get('state',None)
        if not state_id:
            return HttpResponseBadRequest()
        state = get_object_or_404(State, id=state_id)
        
        if invoice_id:
            invoice = get_object_or_404(Invoice, id=invoice_id)
        else:
            return HttpResponseBadRequest()
#            invoice = Invoice.objects.create(state=state)
        items = OrderedService.objects.filter(order__office=request.active_profile.department.state,
                                              invoiceitem__isnull=True, 
                                              sampling__isnull=False, 
                                              execution_place=state)
        if items:
            for item in items:
                InvoiceItem.objects.create(invoice=invoice, ordered_service=item, operator=request.user)
    
            return HttpResponse(simplejson.dumps({
                                                    'success':True,
                                                    'message':u'Накладная заполнена успешно'
                                                }), mimetype='application/json')
        else:
            return HttpResponse(simplejson.dumps({
                                                    'success':False,
                                                    'message':u'Нет позиций для заполнения'
                                                }), mimetype='application/json')
                    

@render_to('print/lab/invoice.html')
def print_invoice(request, invoice_id):
    """
    """
    invoice = get_object_or_404(Invoice, id=invoice_id)
    items = invoice.invoiceitem_set.all()
    vals = items.order_by('ordered_service__sampling').values('ordered_service__sampling').annotate(count=Count('ordered_service__sampling'))
    vals = [item['ordered_service__sampling'] for item in vals]
    

    samplings = Sampling.objects.filter(id__in=vals)

    groups = samplings.order_by('tube').values('tube__name').annotate(count=Count('tube'))
    
    return {
        'invoice':invoice,
        'items':items,
        'groups':groups,
        'samplings':samplings
    }
    