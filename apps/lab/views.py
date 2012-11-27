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
import time
from remoting.models import RemoteState
from remoting.utils import update_result_feed
from lab.widgets import get_widget

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
        'visit__created__gte': u'Дата с',
        'visit__created__lte': u'Дата по',
        'laboratory': u'Лаборатория',
        'visit__office': u'Офис',
        'visit__payer': u'Плательщик',
        'visit__patient': u'Пациент',
        'visit__is_cito': u'cito'
    }
    lookups = {}

    for k, v in request.GET.iteritems():
        if k in allowed_lookups:
            lookups['order__%s' % k] = v

    status = request.GET.get('is_completed', None)
    if status:
        if status in ['0', '1']:
            lookups['order__is_completed'] = bool(int(status))
    if 'visit__is_cito' in lookups:
        lookups['visit__is_cito'] = True
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
                'order__visit__patient__mid_name',
                'order__visit__office__name') \
        .annotate(count=Count('analysis__service__name'))

    r = defaultdict(list)
    for result in results:
        r[result['analysis__service__name']].append([u'%s %s %s' % (result['order__visit__patient__last_name'],\
                                                                     result['order__visit__patient__first_name'],\
                                                                     result['order__visit__patient__mid_name'],\
                                                                     ),
                                                     result['order__visit__created'].strftime("%d.%m.%Y"),\
                                                     result['order__is_completed'],
                                                     result['order__visit__barcode__id'],
                                                     result['order__visit__office__name']
                                                    ])
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

def format_tpl(v):
    def wrap(tpl):
        try:
            return tpl % v
        except:
            return tpl
    return wrap

def print_results(request, order):
    
    widget = get_widget(order.widget)()
    
    result_ctx = widget.make_results(order)

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
            'preview':preview,
    }
    ec.update(result_ctx)

    templates = widget.get_template()
    if widget.allow_tpl_override and order.lab_group and order.lab_group.template:
        templates.insert(0, order.lab_group.template)

    templates = map(format_tpl(request.active_profile.state), templates)  # [t %  for t in templates]
    rendered = render_to_response(templates, ec,
                              context_instance=RequestContext(request))
    if 'format' in request.GET and request.GET['format'] == 'pdf':
        from ho import pisa as pisa
        from StringIO import StringIO
        pdf = StringIO()
        pisa.pisaDocument(rendered.content, pdf)
        return HttpResponse(pdf.getvalue(), mimetype='application/pdf')
    return rendered


def results(request, object_id):
    """
    """
    
    order = get_object_or_404(LabOrder, pk=object_id)
    return print_results(request, order)


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
                ordered_service.to_lab()
                
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


def router(obj, task_type, **kwargs):
    
    if task_type=='remote':
        try:
            post_results(obj)
        except Exception, err:
            logger.exception(err.__unicode__())
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
#            logger.info(u"LabOrder for specimen %s is remote" % lab_order.visit.specimen)
            if state.mode==u'a':
                action_params = {}
                manageable_task.delay(operator=request.user, 
                                      task_type='remote', 
                                      action=router, 
                                      object=lab_order, 
                                      action_params=action_params,
                                      task_params={'countdown':300})
            else:
                pass
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


def clean_value(v):
    if not v:
        return ''
    try:
        if "." in v:
            return str( round( float(v),2 ) )
        return str(int(v))
    except:
        return v

def hem_results(request):

    data = simplejson.loads(request.raw_post_data)
    try:
        specimen = int(data['specimenID'])
    except:
        return HttpResponse('Invalid specimen')
    results = Result.objects.filter(order__visit__barcode__id=specimen)
    for result in results:
        if result.analysis.code in data:
            result.previous_value = result.value
            result.value = clean_value(data[result.analysis.code])
            result.save()
    
    return HttpResponse('OK')


from annoying.decorators import ajax_request

DATE_TYPES = {
    0:'confirmed',
    1:'visit__created',
    2:'executed'
}

@ajax_request
def feed(request):
    """
    """
    data = {
    }
    
    orders = {}
    
    state_key = request.GET.get('state_key', None) or request.POST.get('state_key', None)
    
    if not state_key:
        return { 'error':u'Не указан ключ организации' }
    
    try:
        state = RemoteState.objects.get(secret_key=state_key)
        state = state.state
    except:
        return { 'error':u'Неверный ключ организации' }
    
    start = request.GET.get('start', None) or request.POST.get('start', None)
    end = request.GET.get('end', None) or request.POST.get('end', None)
    specimen = request.GET.get('specimen', None) or request.POST.get('specimen', None)
    
    date_type = request.GET.get('date_type', 0) or request.POST.get('date_type', 0)
    date_type = DATE_TYPES.get(date_type, 0)
    
    if start:
        try:
            start = datetime.datetime.fromtimestamp(int(start))
            
            lookups = {
                'order__visit__office':state,
                'order__%s__gte' % date_type:start,
                'order__is_completed':True
            }
            results = Result.objects.filter(**lookups) \
                .order_by('-order__confirmed','order__visit__specimen')
            
        except Exception, err:
            results = None
    
        if end and results:
            try:
                end = datetime.datetime.fromtimestamp(int(end))
                lookups = {
                    'order__%s__lte' % date_type:end
                }
                results.filter(**lookups)
            except:
                pass
            
    elif specimen:
        specimens = specimen.split(',')
        results = Result.objects.filter(order__visit__office=state, order__visit__specimen__in=specimens, order__is_completed=True)
    
    if not results:
        return {}
    
    for r in results:
        if r.order_id not in orders:
            order = {}
            order['patient'] = {
                'first_name':r.order.visit.patient.first_name,
                'last_name':r.order.visit.patient.last_name,
                'mid_name':r.order.visit.patient.mid_name
            }
            order['order_id'] = r.order_id
            order['specimen'] = r.order.visit.specimen
            order['created'] = r.order.visit.created.strftime('%Y-%m-%d %H:%M:%S')
            order['executed'] = r.order.executed.strftime('%Y-%m-%d %H:%M:%S')
            order['confirmed'] = r.order.confirmed.strftime('%Y-%m-%d %H:%M:%S')
            order['services'] = {}
            orders[r.order_id] = order
        code = r.analysis.service.code
        if not code in orders[r.order_id]['services']:
            orders[r.order_id]['services'][code] = {
                'code':code,
                'name':r.analysis.service.name,
                'tests':[]
            }
        res = {
            'name':r.analysis.name,
            'code':r.analysis.code,
            'value':r.value,
            'measurement':r.measurement,
            'ref_interval':r.ref_range_text
        }
        orders[r.order_id]['services'][code]['tests'].append(res)

    orders = orders.values()
    for o in orders:
        o['services'] = o['services'].values()
    data['orders'] = orders
    
    return data


@ajax_request
def result_loader(request):
    """
    """

    state_id = request.POST.get('state_id', None)
    start = request.POST.get('start', None)
    end = request.POST.get('end', None)
    specimens = request.POST.get('specimens', None)
    date_type = request.POST.get('date_type', None)
    
    try:
        state = RemoteState.objects.get(state__id=state_id)
        state_key = state.secret_key
    except Exception, err:
        print err
        return {
            'error':u'Ошибка определения лаборатории'
        }
    
    if specimens:
        try:
            specimens = specimens.replace(' ','').split(',')
        except:
            return {
                'error':u'Неправильно заданы номера образцов'
            }
        
        results = update_result_feed(state_key, specimens=specimens)
        return {
            'results':results
        }
    
    if start:
        try:
            start = datetime.datetime.strptime(start,'%Y-%m-%dT%H:%M:%S')
        except:
            return {
                'error':u'Некорректная начальная дата'
            }
        if end:
            try:
                end = datetime.datetime.strptime(end,'%Y-%m-%dT%H:%M:%S')
                end = datetime.datetime(year=end.year, month=end.month, day=end.day,
                                        hour=23, minute=59, second=59)
                print end
            except Exception, err:
                print err
                return {
                    'error':u'Некорректная конечная дата'
                }
        results = update_result_feed(state_key, start, end, update=False)
        return {
            'results':results
        }
            
    return {
        'error':u'Нет данных'
    }


def sampling_tree(request, visit_id):
    states = defaultdict(list)
    tree = []
    samplings = Sampling.objects.filter(visit__id=visit_id).order_by('laboratory__id',)
    for sampling in samplings:
        states[sampling.laboratory.__unicode__()].append(sampling)
    for k, v in states.iteritems():
        children = [{'id': item.id, 'text': item.tube.name, 'leaf': True} for item in v]
        node = {
            'id': k,
            'text': k,
            'leaf': False,
            'expanded': True,
            'children': children
        }
        tree.append(node)

    json = simplejson.dumps(tree)

    return HttpResponse(json, mimetype="application/json")
