# -*- coding: utf-8 -*-
from django.template import Context, loader
from django.conf import settings
from examination.models import ExaminationCard, Template, FieldSet, Card
from django.contrib.contenttypes.models import ContentType
from django.views.generic.simple import direct_to_template
import simplejson
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from annoying.decorators import render_to
from examination.forms import EpicrisisForm
from visit.models import Visit, OrderedService
from django.views.decorators.gzip import gzip_page
from django.core.serializers.json import DjangoJSONEncoder
import datetime
from patient.models import Patient
#from lab.models import LabOrder, Result

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
    
    MONTH_NAMES = {
        1: u'Январь',
        2: u'Февраль',
        3: u'Март',
        4: u'Апрель',
        5: u'Май',
        6: u'Июнь',
        7: u'Июль',
        8: u'Август',
        9: u'Сентябрь',
        10: u'Октябрь',
        11: u'Ноябрь',
        12: u'Декабрь'
    }
    
    patient = request.GET.get('patient')
    if not patient:
        return u'не задан пациент'
    
    get_years = request.GET.get('get_years')
    get_months = request.GET.get('get_months')
    get_visits = request.GET.get('get_visits')
    get_orders = request.GET.get('get_orders')
    
    visits = Visit.objects.filter(patient = patient).order_by('created')
    os_list = OrderedService.objects.filter(order__patient = patient)
    cards = Card.objects.filter(ordered_service__order__patient = patient).order_by('ordered_service__order__id')
    min_date = visits[0].created
    max_date = visits.reverse()[0].created  
    today = datetime.date.today()  
#    laborder_list = LabOrder.objects.filter(visit__patient = patient)    
#    results = Result.objects.filter(order__visit__patient = patient).order_by('order__visit__id','analysis__service__id')
    
    def build_exam_tree(order):
        exam_tree = []
        exams = cards.filter(ordered_service = order.id)
        for excard in exams:
            exam_node = {
                "id":"exam_%s" % (excard.id),
                "text":excard.print_name,
                "date":excard.created,
                "staff":order.staff and order.staff.short_name() or '',
                "singleClickExpand":True,
                "leaf": True
            }
            exam_tree.append(exam_node)
        return exam_tree
    
    def build_order_tree(visit):
        order_tree = []
        services = os_list.filter(order = visit.id)
        for serv in services:
            order_childs = build_exam_tree(serv)
            if get_orders:
                if serv.service.lab_group:
                    prefix = 'labservice'
                    try:
                        prefix = serv.service.labservice.is_manual and 'manual'+prefix or prefix
                    except:
                        pass
                else:
                    prefix = 'order'
                
                order_node = {
                    "id":"%s_%s" % (prefix,serv.id),
                    "text":serv.service.name,
                    "date":serv.created,
                    "staff":serv.staff and serv.staff.staff.short_name() or '',
                    "opetator": visit.operator.username,
                    "cls":"multi-line-text-node",
                    'singleClickExpand':True,
                    "children": order_childs,
                    "leaf": len(order_childs) == 0
                }
                order_tree.append(order_node)
            else:
                if order_childs:
                    order_tree += order_childs
        return order_tree
    
    def build_visit_tree(visit_list):
        visit_tree = []
        if get_visits:
            for visit in visit_list:
                visit_childs = []
                visit_childs = build_order_tree(visit)
                visit_node = {
                    "id":"visit_%s" % (visit.barcode.id),
                    "text":"Прием %s" % (visit.barcode.id),
                    "date":visit.created,
                    "opetator": visit.operator.first_name,
                    'singleClickExpand':True,
                    "children": visit_childs,
                    "leaf": len(visit_childs) == 0
                }
                visit_tree.append(visit_node)
        else:
            for visit in visit_list:
                visit_tree_part = build_order_tree(visit)
                if visit_tree_part:
                    visit_tree += visit_tree_part
        return visit_tree
    
    def build_month_tree(year_visit_list,year):
        month_tree = []
        if get_months:
            for month in range(1,13):
                month_visit_list = year_visit_list.filter(created__month = month)
                mchilds = build_visit_tree(month_visit_list)
                if not month_visit_list:
                    continue
                text = MONTH_NAMES[month]
                if year == today.year:
                    if month == today.month:
                        text = u'В этом месяце'
                    if month == today.month-1:
                        text = u'В прошлом месяце'    
                month_node = {
                    "id":'month_%s_%s' % (year,month),
                    "text": text,
                    "children":mchilds,
                    "singleClickExpand":True,
                    "leaf": len(mchilds) == 0
                }
                if mchilds:
                    month_tree.append(month_node)
        else:
            month_tree = build_visit_tree(year_visit_list)
        return month_tree
    
    def build_year_tree(visit_list,year1,year2):
        year_tree = []
        if get_years:
            for year in range(year1,year2+1):
                visits_for_year = visit_list.filter(created__year = year)
                ychilds = build_month_tree(visits_for_year,year)
                text = year
                if year == today.year:
                    text = u'В этом году'
                if year == today.year-1:
                    text = u'В прошлом году'
                year_node = {
                    "id":'year_%s' % (year),
                    "text": text,
                    "children":ychilds,
                    "singleClickExpand":True,
                    "leaf": len(ychilds) == 0
                }
                if ychilds:
                    year_tree.append(year_node)
        else:
            year_tree = build_visit_tree(visit_list)
        return year_tree
    
    def build_patient_tree(patient_id=False):
        if patient_id:
            try:
                patient = Patient.objects.get(id=patient_id)
            except:
                return []
            patient_history = build_year_tree(visits,min_date.year,max_date.year)
            patient_node = {
                "id":'patient_%s' % (patient_id),
                "text": patient.full_name(),
                "children":patient_history,
                "expanded":True,
                "singleClickExpand":True,
                "leaf":patient_history and False
            }
        return patient_node

    tree = [build_patient_tree(patient)]
    
    """if get_years:
        tree = build_year_tree(visits,min_date.year,max_date.year)
    else:
        if get_visits:
            tree = build_visit_tree(visits)
        else:
            for visit in visits:
                orders = os_list.filter(order = visit.id)
                if get_orders:
                    order_tree_part = []
                    order_tree_part = build_order_tree(visit)
                    if order_tree_part:
                        tree += order_tree_part
                else:
                    for order in orders:
                        exam_tree_part = []
                        exam_tree_part = build_exam_tree(order)
                        if exam_tree_part:
                            tree += exam_tree_part"""
    _result_tree = simplejson.dumps(tree,cls=DjangoJSONEncoder)
    return _result_tree
    
@gzip_page
def history_tree(request):
    resp = get_history_tree(request)
    cb = request.GET.get('cb')
    if cb:
        resp = u'%s(%s)' % (cb,resp)
    return HttpResponse(resp, mimetype="application/json")
