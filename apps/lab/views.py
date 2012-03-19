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
            group = cur_service.parent.__unicode__()#", ".join([node.__unicode__() for node in cur_service.get_ancestors()]) 
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
    
    return render_to_response(["print/lab/results_state_%s.html" % request.active_profile.state,"print/lab/results.html"],
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
    

def confirm_results(request):
    """
    """
    if request.method=='POST':
        lab_order = request.POST.get('order', None)
        if lab_order:
            lab_order = get_object_or_404(LabOrder, id=lab_order)
            Result.objects.filter(analysis__service__labservice__is_manual=False, order=lab_order, validation=0).delete()
            Result.objects.filter(order=lab_order, validation=-1).update(validation=1)
            lab_order.is_completed = True
            for result in lab_order.result_set.all():
                if not result.is_completed():
                    lab_order.is_completed = False
                    break
            lab_order.save()
            msg = lab_order.is_completed and u'Лабораторный ордер подтвержден' or u'Присутствуют пустые значения. Лабораторный ордер не подтвержден'
            if lab_order.is_completed:
                try:
                    state = lab_order.visit.office.remotestate
                    all_lab_orders = lab_order.visit.laborder_set.all()
                    confirm = True
                    for l in all_lab_orders:
                        if not l.is_completed:
                            confirm = False
                            break
                    print "Подтверждение всех ордеров:", confirm
                    resp = post_results(lab_order, confirm)
                    for r in resp:
                        print r['success'],r['message']
                except Exception, err:
                    print "error", err
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


from direct.providers import remote_provider
from extdirect.django.decorators import remoting


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
            print err
            next_place = u"Архив"
    except:
        next_place = u'Образец не найден'
    data = {
        'next':next_place
    }
    return dict(success=True, data=data)