# -*- coding: utf-8 -*-

"""
"""
from annoying.decorators import render_to
from django.shortcuts import get_object_or_404
from examination.models import Template, FieldSet, Card
import simplejson
from visit.models import OrderedService, Visit
from lab.models import Result
from django.views.generic.simple import direct_to_template
from service.models import BaseService
import operator
from scheduler.models import Preorder

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
        for t in d['tickets']:
            if t['private'] == True:
                d['tickets'].remove(t)
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
                             'text':"%s, %s" % (card.mkb_diag.code, card.mkb_diag.name)
                             })
    asgmt_list = Preorder.objects.filter(patient=card.ordered_service.order.patient.id,card=card.id)
    assigments = [{'count':a.count,'text':a.service and a.service.base_service.name or u'Нет названия'} for a in asgmt_list]
    field_sets = dict([(fs.name, fs.title) for fs in FieldSet.objects.all()]) 
    data = card.data and simplejson.loads(card.data) or []
    for d in data:
        if 'section' in d:
            for t in d['tickets']:
                if t['private'] == True:
                    d['tickets'].remove(t)
            d['title'] = field_sets[d['section']]
    
    ctx = {
        'card':card,
        'data':data,
        'gdata':general_data,
        'asgmts':assigments
    }

    return ctx

@render_to('widget/lab/results.html')
def lab_results(request, object_id):
    order = get_object_or_404(OrderedService, pk=object_id)
    result_set = Result.objects.filter(order__visit=order.order,analysis__service=order.service.id,analysis__service__labservice__is_manual=False)\
        .order_by('analysis__service__%s' % BaseService._meta.tree_id_attr, 
                '-analysis__service__%s' % BaseService._meta.left_attr,
                'analysis__order') 
    
    cur_service = None
    cur_group = None
    result_list = []
    set_len = 0
    for result in result_set:
        cls = result.is_completed() and 'result' or 'progress'
        result_list.append({'class':cls,'object':result})
            
    preview = request.GET.get('preview')
    
    ec = {
            'results':result_list,
    }
    
    return direct_to_template(request=request, 
                              template="widget/lab/results.html",
                              extra_context=ec)

MANUAL_TEST_CONFIG = {
    'sperm':{
        'mode':'group',
        'template':'widget/lab/manual/sperm.html',
        'delimiter':'::'
    },
    'ugsmear':{
        'mode':'column',
        'template':'widget/lab/manual/ugsmear.html',
        'delimiter':'::',
        'columns':[u'Уретра',u'Шейка матки',u'Влагалище']
    }
}

def lab_manuals(request, object_id):
    
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
            name = result.analysis.name.split(cfg['delimiter'])
            manual_result_list.append({'class':'result','name':name[0],'object':result})
        
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
        
    return direct_to_template(request=request, 
                              template=cfg['template'],
                              extra_context=mc)
    
def visit_preview(request, object_id):
    visit = get_object_or_404(Visit, pk=object_id)
    services = OrderedService.objects.filter(order=visit.id)
    
    ec = {
            'visit':visit,
            'services':services,
    }
    
    return direct_to_template(request=request, 
                              template="widget/visit/visit_preview.html",
                              extra_context=ec)
    
    