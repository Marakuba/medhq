# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, render_to_response
from lab.models import LabOrder, Result, Invoice, InvoiceItem, Sampling,\
    EquipmentTask
from service.models import BaseService
import datetime
from django.views.generic.simple import direct_to_template
import simplejson
from django.http import HttpResponse, HttpResponseBadRequest
from visit.models import OrderedService, Visit
from state.models import State
from annoying.decorators import render_to
from django.db.models.aggregates import Count
from collections import defaultdict
import operator
from remoting.views import post_results
from direct.providers import remote_provider
from extdirect.django.decorators import remoting

from direct.providers import remote_provider
from extdirect.django.decorators import remoting

import logging
from taskmanager.tasks import manageable_task, SendError
from urllib2 import URLError

logger = logging.getLogger('lab.models')

@remoting(remote_provider, len=1, action='lab', name='getPatientInfo')
def get_patient_info(request):
    data = simplejson.loads(request.raw_post_data)
    order_id = data['data'][0]
    laborder = LabOrder.objects.get(id=order_id)
    patient = laborder.visit.patient
    data = {
        'last_name':patient.last_name,
        'first_name':patient.first_name,
        'mid_name':patient.mid_name,
        'birth_day':patient.birth_day,
        'gender':patient.gender,
    }
    return dict(success=True, data=data)

@render_to('print/lab/register.html')
def print_register(request):
    allowed_lookups = {
        'visit__created__gte':u'Дата с',
        'visit__created__lte':u'Дата по',
        'laboratory':u'Лаборатория',
        'visit__office':u'Офис',
        'visit__patient':u'Пациент',
        'visit__is_cito':u'cito'
    }
    lookups = {}
    
    for k,v in request.GET.iteritems():
        if k in allowed_lookups:
            lookups['order__%s' % k] = v

    status = request.GET.get('is_completed', None)
    if status:
        if status in ['0','1']:
            lookups['order__is_completed'] = bool(int(status))
    
    results = Result.objects.filter(**lookups) \
        .order_by('analysis__service__name',
                  'order__visit__created',
                  'order__visit__patient__last_name') \
        .values('analysis__service__name',
                'order__visit__created',
                'order__visit__barcode__id',
                'order__is_completed',
                'order__visit__patient__last_name',
                'order__visit__patient__first_name',
                'order__visit__patient__mid_name') \
        .annotate(count=Count('analysis__service__name'))

        
    r = defaultdict(list)
    for result in results:
        r[result['analysis__service__name']].append([ u'%s %s %s' % (result['order__visit__patient__last_name'],\
                                                                     result['order__visit__patient__first_name'],\
                                                                     result['order__visit__patient__mid_name'],\
                                                                     ), 
                                                     result['order__visit__created'].strftime("%d.%m.%Y"),\
                                                     result['order__is_completed'] ])
    result_list = []
    for k in sorted(r.keys()):
        tmp_list = sorted(r[k], key=operator.itemgetter(0))
        last = tmp_list[-1]
        for i in range(len(tmp_list)-2, -1, -1):
            if last[0] == tmp_list[i][0]:
                del tmp_list[i]
            else:
                last = tmp_list[i]
        result_list.append( [ k, tmp_list ] )
    return {'result_list':result_list}

MANUAL_TEST_CONFIG = {
    'sperm':{
        'mode':'group',
        'template':'print/lab/manual/sperm.html',
        'delimiter':'::'
    },
    'ugsmear':{
        'mode':'column',
        'template':'print/lab/manual/ugsmear.html',
        'delimiter':'::',
        'columns':[u'Уретра',u'Шейка матки',u'Влагалище']
    }
}

from django.template import loader, RequestContext

def print_results(request, order):
    result_qs = Result.objects.filter(analysis__service__labservice__is_manual=False, order=order, to_print=True).order_by('analysis__service__%s' % BaseService._meta.tree_id_attr, 
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
            group = cur_service.parent#", ".join([node.__unicode__() for node in cur_service.get_ancestors()]) 
            if cur_group != group:
                cur_group = group
                result_list.append({'class':'group','object':cur_group}) 
            if set_len>1:
                result_list.append({'class':'service','object':cur_service.__unicode__()})
        
        cls = result.is_completed() and 'result' or 'progress'
        result_list.append({'class':cls,'object':result})
            
    if set_len>1:
        result_list.append({'class':'blank','object':cur_service.gen_ref_interval or ' '})

    preview = request.GET.get('preview')
    
    NOW = datetime.datetime.now()
    
    if not preview:
        if order.is_completed and not order.print_date:
            order.is_printed = True
            order.print_date = NOW
            order.save()
        
    services = order.visit.orderedservice_set.filter(executed__isnull=False, print_date__isnull=True)
    services.update(print_date=NOW)
    
    
    ec = {
            'order':order,
            'results':result_list,
            'preview':preview,
    }
    template = order.lab_group.template or "print/lab/results.html"
    return render_to_response(["print/lab/results_state_%s.html" % request.active_profile.state,template],
                              ec,
                              context_instance=RequestContext(request))

def print_manuals(request, object_id):
    """
    """
    os = get_object_or_404(OrderedService, pk=object_id)
    
    #### Рендеринг ручных тестов
    
    manuals = []
    
    code = os.service.labservice.code
    if not MANUAL_TEST_CONFIG.has_key(code):
        raise
    
    cfg = MANUAL_TEST_CONFIG[code]
    mc = {
        'service':os.service,
        'object':os,
        'order':os.order
    }
    
    results = Result.objects.filter(order__visit=os.order, analysis__service=os.service)
    
    if len(results):
        lab_order = results[0].order
        mc['laborder'] = lab_order
        
    if cfg['mode']=='group':
        manual_result_list = []
        cur_group = None
        for result in results:
            name, group = result.analysis.name.split(cfg['delimiter'])
            if cur_group!=group:
                cur_group = group
                manual_result_list.append({'class':'service','name':cur_group})
            manual_result_list.append({'class':'result','name':name,'object':result})
        
        mc['results'] = manual_result_list

        
    elif cfg['mode']=='column':
        mc['columns'] = cfg['columns']
        data = {}
        manual_result_list = []
        
        for result in results:
            name, col = result.analysis.name.split(cfg['delimiter'])
            if not data.has_key(name):
                data[name] = [result.analysis.order,name,{},result]
            data[name][2][col] = result.value
        
        for item in sorted(data.values(),key=operator.itemgetter(0)):
            values = []
            for c in cfg['columns']:
                values.append(item[2][c])
            manual_result_list.append({'class':'result','name':item[1],'values':values,'object':item[3]})
        
        mc['results'] = manual_result_list
        
    preview = request.GET.get('preview')
    
    NOW = datetime.datetime.now()
    
    if not preview:
        if os.executed and not os.print_date:
            os.print_date = NOW
            os.save()
        
    return direct_to_template(request=request, 
                              template=cfg['template'],
                              extra_context=mc)
    

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
            ordered_services = lab_order.visit.orderedservice_set.filter(execution_place=lab_order.laboratory,
                                                                         service__lab_group=lab_order.lab_group)
            for ordered_service in ordered_services:
                for item in ordered_service.service.analysis_set.all():
                    result, created = Result.objects.get_or_create(order=lab_order,
                                                                   analysis=item, 
                                                                   sample=ordered_service.sampling)
            for result in lab_order.result_set.all():
                if not result.is_completed():
                    lab_order.is_completed = False
                    break
            lab_order.save()

            return HttpResponse(simplejson.dumps({
                                                    'success':True,
                                                    'status':lab_order.is_completed,
                                                    'message':u'Исследования были восстановлены'
                                                }), mimetype='application/json')
    return HttpResponseBadRequest()


def router(object, task_type, **kwargs):
    
    if task_type=='remote':
        confirm = 'confirm' in kwargs and kwargs['confirm'] or False
        try:
            post_results(object)
        except Exception, err:
            raise SendError(err)

@remoting(remote_provider, len=1, action='lab', name='confirmResults')
def confirm_results(request):
    """
    """
    data = simplejson.loads(request.raw_post_data)
    laborder_id = data['data'][0]
    success = True
    try:
        lab_order = LabOrder.objects.get(id=laborder_id)
    except:
        return dict(success=False, message="Laborder %s not found" % laborder_id)
    
    lab_order.confirm_results()
    
    msg = lab_order.is_completed and u'Лабораторный ордер подтвержден' or u'Присутствуют пустые значения. Лабораторный ордер не подтвержден'
    
    if lab_order.is_completed:
        try:
            state = lab_order.visit.office.remotestate
            logger.info(u"LabOrder for specimen %s is remote" % lab_order.visit.specimen)
            action_params = {
            }
            manageable_task.delay(operator=request.user, 
                                  task_type='remote', 
                                  action=router, 
                                  object=lab_order, 
                                  action_params=action_params,
                                  task_params={'countdown':20})
#                    for r in resp:
#                        logger.debug(u"LAB: %s %s" % (r['success'],r['message']))
        except Exception, err:
            pass
        
    return {
        'success':lab_order.is_completed,
        'message':msg
    }
    

def pull_invoice(request):
    """
    """
    if request.method=='POST':
        invoice_id = request.POST.get('invoice',None)
        state_id = request.POST.get('state',None)
        office_id = request.POST.get('office',request.active_profile.department.state.id)
        if not state_id:
            return HttpResponseBadRequest()
        state = get_object_or_404(State, id=state_id)
        
        if invoice_id:
            invoice = get_object_or_404(Invoice, id=invoice_id)
        else:
            return HttpResponseBadRequest()
#            invoice = Invoice.objects.create(state=state)
        items = OrderedService.objects.filter(order__office__id=office_id,
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


@remoting(remote_provider, len=1, action='lab', name='getSpecimenStatus')
def get_specimen_status(request):
    data = simplejson.loads(request.raw_post_data)
    barcode_id = data['data'][0]
    try:
        visit = Visit.objects.get(barcode__id=barcode_id)
        tasks = EquipmentTask.objects.filter(ordered_service__order__barcode__id=barcode_id, status=u'wait') \
            .order_by('equipment_assay__equipment__order')
        try:
            task = tasks[0]
            next_place = task.equipment_assay.equipment.name
        except Exception, err:
            logger.error(u"LAB: %s " % err)
            next_place = u"Архив"
    except:
        next_place = u'Образец не найден'
    data = {
        'next':next_place
    }
    return dict(success=True, data=data)


@remoting(remote_provider, len=1, action='lab', name='confirmManualService')
def confirm_manual_service(request):
    data = simplejson.loads(request.raw_post_data)
    orderedservice_id = data['data'][0]
    try:
        obj = OrderedService.objects.get(id=orderedservice_id)
    except:
        return dict(success=False, message="Ordered Service not found")
    
    results = Result.objects.filter(order__visit=obj.order, analysis__service=obj.service)
    if len(results):
        lab_order = results[0].order
        try:
            state = lab_order.visit.office.remotestate
            logger.info(u"LabOrder for specimen %s is remote" % lab_order.visit.specimen)
            action_params = {
            }
            manageable_task.delay(operator=request.user, 
                                  task_type='remote', 
                                  action=router, 
                                  object=lab_order, 
                                  action_params=action_params,
                                  task_params={'countdown':20})
#                    for r in resp:
#                        logger.debug(u"LAB: %s %s" % (r['success'],r['message']))
        except Exception, err:
            pass
        
        obj.status = u'з'
        obj.save()
    else:
        return dict(success=False, message="Results not found")

    
    return dict(success=True, message=u"Исследование успешно подтверждено")
