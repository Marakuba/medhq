# -*- coding: utf-8 -*-
from django.utils import simplejson
from django.http import HttpResponse, HttpResponseRedirect
from service.models import BaseService, ExtendedService
from django.db import connection
from django.core.cache import get_cache
from patient.models import Patient
from django.shortcuts import get_object_or_404, render_to_response
from pricelist.models import Discount
from django.db.models import Q
from django.contrib.auth import login

from annoying.decorators import render_to
from django.contrib.auth.forms import AuthenticationForm
from django.conf import settings
from django.views.generic.simple import direct_to_template
from django.contrib.auth.decorators import login_required
from lab.models import Sampling
from django.views.decorators.gzip import gzip_page
from promotion.models import Promotion, PromotionItem
from state.models import State
from pricelist.models import Price
from django.db.models import Max
from staff.models import Position
import datetime
import time
from django.core.serializers.json import DjangoJSONEncoder

import logging
from pricelist.models import get_actual_ptype
from staff.models import Staff
from examination.models import FieldSet, SubSection, Questionnaire
from examination.widgets import get_widget
try:
    from collections import OrderedDict
except:
    from ordereddict import OrderedDict #@Reimport

logger = logging.getLogger('general')


def get_apps(request):
    apps = []
    if request.user.has_perm('visit.add_visit') or request.user.is_superuser:
        apps.append([u'Регистратура',u'/webapp/registry/'])
    if request.user.has_perm('lab.change_laborder') or request.user.is_superuser:
        apps.append([u'Лаборатория',u'/webapp/laboratory/'])
    if request.user.has_perm('examination.add_examinationcard') or request.user.is_superuser:
        apps.append([u'Обследования',u'/webapp/examination/'])
    if request.user.is_superuser:
        apps.append([u'Отчеты',u'/webapp/reporting/'])
    apps.append([u'Штрих-коды',u'/webapp/barcoding/'])
    if request.user.is_staff or request.user.is_superuser:
        apps.append([u'Администрирование',u'/admin/'])

    return apps
    


def auth(request, authentication_form=AuthenticationForm):
    
#    if request.user.is_authenticated():
#        return HttpResponseRedirect('/webapp/cpanel/')

    redirect_to = ''#request.REQUEST.get(redirect_field_name, '')

    if request.method == "POST":
        form = authentication_form(data=request.POST)
        if form.is_valid():
            # Light security check -- make sure redirect_to isn't garbage.

#            if not redirect_to or ' ' in redirect_to:
#                redirect_to = settings.LOGIN_REDIRECT_URL

            # Heavier security check -- redirects to http://example.com should
            # not be allowed, but things like /view/?param=http://example.com
            # should be allowed. This regex checks if there is a '//' *before* a
            # question mark.
#            elif '//' in redirect_to and re.match(r'[^\?]*//', redirect_to):
#                    redirect_to = settings.LOGIN_REDIRECT_URL

            # Okay, security checks complete. Log the user in.
            user = form.get_user()
            login(request, user)

            if request.session.test_cookie_worked():
                request.session.delete_test_cookie()

            response = {
                'success':True
            }
            
            active_profile = getattr(request, 'active_profile', None)
            
            if active_profile:
                next_url = request.POST.get('next',None)
                response['redirect_to'] = u'/webapp/setactiveprofile/%d/%s' % (active_profile.id, next_url and u'?redirect_to=%s' % next_url or u'')
            else:
                response = {
                    'success':False,
                    'message':u'Ошибка авторизации: не задан профиль пользователя'
                }
                
            
        else:
            response = {
                'success':False,
                'message':u'Ошибка авторизации'
            }
        
        return HttpResponse(simplejson.dumps(response), mimetype="application/json")

    else:
        request.session.set_test_cookie()
        return direct_to_template(request, template='webapp/auth/index.html')


@login_required    
def set_active_profile(request, position_id):
    request.session['ACTIVE_PROFILE'] = position_id
    redirect_to = request.GET.get('redirect_to','/webapp/cpanel/')
    return HttpResponseRedirect(redirect_to=redirect_to)


@login_required
@render_to('webapp/cpanel/index.html')
def cpanel(request):
    perms = {
        'registry':request.user.has_perm('visit.add_visit') or request.user.is_superuser,
        'laboratory':request.user.has_perm('lab.change_laborder') or request.user.is_superuser,
        'examination':request.user.has_perm('examination.add_examinationcard') or request.user.is_superuser,
        'reporting':request.user.is_superuser,
        'admin':request.user.is_staff or request.user.is_superuser,
    }
    return {
        'perms':simplejson.dumps(perms)
    }

    
@login_required
@render_to('webapp/registry/index.html')
def registry(request):
    return {
        'apps':simplejson.dumps(get_apps(request))
    }
    

@login_required
@render_to('webapp/service/index.html')
def service(request):
    return {}
    

@login_required
@render_to('webapp/testing/index.html')
def testing(request):
    return {}
    

@login_required
@render_to('webapp/reporting/index.html')
def reporting(request):
    return {
        'apps':simplejson.dumps(get_apps(request))
    }
    
@login_required
@render_to('webapp/barcoding/index.html')
def barcoding(request):
    return {
        'apps':simplejson.dumps(get_apps(request))
    }
    

@login_required
@render_to('webapp/laboratory/index.html')
def laboratory(request):
    return {
        'apps':simplejson.dumps(get_apps(request))
    }

@login_required
@render_to('webapp/accounting/index.html')
def accounting(request):
    return {
        'apps':simplejson.dumps(get_apps(request))
    }

@login_required
@render_to('webapp/examination/index.html')
def examination(request):
    section_scheme = OrderedDict()
    sections = FieldSet.objects.all()
    required_tickets = []
    for sec in sections:
        subsecs = SubSection.objects.filter(section=sec.id)
        section_scheme[sec.name] = {
                                    'order':sec.order,
                                    'title':sec.title,
                                    'name':sec.name,
                                    'items':[]
                                    }
        for subsec in subsecs:
            widget = get_widget(subsec.widget)(request,subsec.title,'')
            ticket = {'title':subsec.title,
                'order':sec.order,
                'xtype':subsec.widget,
                'value':'',
                'printable':True,
                'title_print':True,
                'private':False,
                'section':sec.name,
                'fixed':getattr(widget,'fixed', False),
                'required':getattr(widget,'required', False),
                'unique':getattr(widget,'unique', False)
            }
            if ticket['required']:
                required_tickets.append(ticket)
            else: 
                section_scheme[sec.name]['items'].append(ticket)
    quests = Questionnaire.objects.all()
    questionnaires = [{'name':quest.name,
                      'code':quest.code
                      } for quest in quests]
    return {
        'section_scheme':simplejson.dumps(section_scheme),
        'questionnaires':simplejson.dumps(questionnaires),
        'required_tickets':simplejson.dumps(required_tickets),
        'apps':simplejson.dumps(get_apps(request))
    }

@login_required
@render_to('webapp/oldexam/index.html')
def oldexam(request):
    return {}

@login_required
@render_to('webapp/calendar/index.html')
def calendar(request):
    return {}
    

@login_required
@render_to('webapp/helpdesk/index.html')
def helpdesk(request):
    return {}
    

@login_required
@render_to('webapp/treatmentroom/index.html')
def treatmentroom(request):
    return {}
    

def get_service_tree(request):

    import sys
    
    sys.setrecursionlimit(3000)

    """
    Генерирует дерево в json-формате.
    
    Ключ кэша:
    
    service_list_-stateId или *-_-способ оплаты-
    
    service_list_*_н - любая организация, способ оплаты - наличный платеж
    service_list_2_д - организация #2, способ оплаты - ДМС 
    и т.д.
    """

    def promo_dict(obj):
        
        def node_dict(obj):
            try:
                bs = promotions_bs[obj.base_service_id]
                for k,v in result[obj.base_service_id].iteritems():
                    if v['extended_service__state__id']==obj.execution_place_id:
                        es = v['extended_service__id']
                        price = v['value']
                        break
#                es = bs.extendedservice_set.get(state=obj.execution_place)
                if not es:
                    return None
                node = {
                    "id":ext and es or '%s-%s' % (obj.base_service_id,obj.execution_place_id),
                    "text":"%s" % (bs['base_service__short_name'] or bs['base_service__name'],),
                    "price":price,
                    "c":obj.count or 1
                }
                node['staff'] = obj.base_service_id in staff_all and sorted(staff_all[obj.base_service_id], key=lambda staff: staff[1])
                return node
            except Exception, err:
                logger.error(u"NODE DICT: %s" % err.__unicode__())
                return None
            
        return {
            'id':obj['id'],#u'%s_%s' % (obj.base_service.id, obj.execution_place.id),
            'text':obj['name'],#obj.base_service.short_name or obj.base_service.name,
            'leaf':True,
            'nodes':[node_dict(node) for node in obj['items'] if node],
            'discount':obj['discount_id'],
            'price':obj['total_price'],
            'isComplex':True
        }
                
    def clear_tree(tree=[],child_list=[]):
        '''
        Рекурсивно очищает список, содержащий дерево, от пустых групп;
        Одеревенезирует этот список.
        empty - признак того, есть ли в текущей группе элементы
        child_list - двумерный список всех детей для еще не найденных родителей.
        '''
        #Если список пуст, удалять больше нечего
        if len(tree)==0:
            return (child_list and child_list[0]) or []
        else:
            node = tree[-1]
            parent = node.get_parent()
            
            bro = []
            childs = []
            
            for item in child_list:
                #Если список детей <> [] и либо item[0] и текущий node - корни дерева, либо относятся к одному родителю
                if item and ((not item[0]['parent'] and not parent) or (parent and item[0]['parent'] == parent)):
                    # то это братья
                    bro = item
                if item and not node.is_leaf_node() and item[0]['parent']==node.id:
                    childs = item
#            if node.name == 'Gr1':
#                import pdb; pdb.set_trace()                    
            tree_nodes = []
            if not node.is_leaf_node() and not childs:
                #удаляем текущий элемент
                node = None
            else:
                
                if node.is_leaf_node():
                    for service in result[node.id]:
                        tree_node = {
                                "id":ext and service or '%s-%s' % (node.id,result[node.id][service]['extended_service__state__id']),
                                "text":"%s" % (node.short_name or node.name),
                                "cls":"multi-line-text-node",
                                "price":str(result[node.id][service]['value']),
                                "exec_time":"%s" % (node.execution_time and u"%s мин" % node.execution_time or u''),
                                "iconCls":"ex-place-%s" % result[node.id][service]['extended_service__state__id'],
                                "parent":parent,
                                "leaf":True}
                        if not ext:
                            tree_node['staff'] = node.id in staff_all and sorted(staff_all[node.id], key=lambda staff: staff[1])
                        tree_nodes.append(tree_node)    
                        #nodes.append(tree_node)
                else: 
                    tree_node = {
                            "id":ext and 'group-%s' % node.id or node.id,
                            "leaf":False,
                            'text': "%s" % (node.short_name or node.name,),
                            'singleClickExpand':True,
                            "parent":parent,
                            'children':childs
                            }
                #Если есть братья, добавляем текущий элемент к списку братьев
                #Иначе создаём новый список братьев, в котором текущий элемент будет первым братом
                    tree_nodes.append(tree_node) 
                
                if bro:
                    for tr in tree_nodes:
                        bro.insert(0,tr)
                else: 
                    child_list.insert(0,tree_nodes)
                
                #Если есть список дочерних элементов и текущий элемент - их родитель,
                #то удаляем этот список из общего списка детей, за ненадобностью    
                if childs and tree_nodes[0]['leaf'] == False:
                    child_list.remove(childs)
                    
            tree = clear_tree(tree[:-1],child_list) or []
            
#            if node:
#                tree.append(node)
            return tree 
    
    payment_type = request.GET.get('payment_type',u'н')
    staff = request.GET.get('staff')
    nocache = request.GET.get('nocache')
    recache = request.GET.get('recache')
    promotion = request.GET.get('promotion')
    all = request.GET.get('all')
    ext = request.GET.get('ext')
    payer = request.GET.get('payer')

    TODAY = datetime.date.today()
    on_date = request.GET.get('on_date',TODAY)
    if on_date and not isinstance(on_date, datetime.date):
        try:
            on_date = time.strptime(on_date, '%d-%m-%Y')
            on_date = datetime.date(year=on_date.tm_year,month=on_date.tm_mon,day=on_date.tm_mday)
            nocache = True
        except:
            on_date = TODAY
    
    state = None
    ap = request.active_profile
    if (settings.SERVICETREE_ONLY_OWN or ap.department.state.type=='p') and ap and not all:
        state = ap.department.state

    try:
        cache = get_cache('service')
    except:
        raise "Service cache must be defined!"
            
    if payer:
        try:
            payer = State.objects.get(id=payer)
        except:
            payer = None
            
    if staff:
        try:
            staff = Position.objects.get(id=staff)
        except:
            staff = None
    p_type_id = get_actual_ptype()
        
    _cache_key = u'%sservice_list_%s_%s_%s_%s' % (ext and 'ext_' or '', state and state.id or u'*', payment_type, payer and payer.id or '*', p_type_id or '*')
    
    # запрос с параметром recache удаляет ВСЕ записи в нём
    if recache:
        cache.clear()

    # если передаем параметр nocache, кэширование не происходит. иначе пробуем достать кэш по ключу
    if nocache:
        _cached_tree = None
    else:
        _cached_tree = cache.get(_cache_key)
        
        
    # если отсутствует кэш, то начинаем построение дерева услуг  
    _cached_tree = None  
    if not _cached_tree:

        price_args = dict(extended_service__is_active=True, 
                    payment_type=payment_type,
                    price_type='r',
                    on_date__lte=on_date)
        if staff:
            price_args['extended_service__staff']=staff
        if state:
            price_args['extended_service__branches']=state
        if payer:
            price_args['payer'] = payer.id
        else:
            price_args['payer__isnull'] = True
        price_args['type'] = p_type_id
    
        nodes = []
        values = Price.objects.filter(**price_args).\
            order_by('extended_service__id','on_date').\
            values('on_date','extended_service__id','extended_service__state__id','extended_service__staff__id','value','extended_service__base_service__id').\
            annotate(Max('on_date'))
        result = {}
        for val in values:
            if not result.has_key(val['extended_service__base_service__id']):
                result[val['extended_service__base_service__id']] = {}
            result[val['extended_service__base_service__id']][val['extended_service__id']] = val
        
        BaseService.cache_parents()
        
        staff_all = ExtendedService.get_all_staff()
        
        for base_service in BaseService.objects.select_related().all().order_by(BaseService._meta.tree_id_attr, BaseService._meta.left_attr, 'level'): #@UndefinedVariable
            if base_service.is_leaf_node():
                if result.has_key(base_service.id):
                    nodes.append(base_service)
            else:
                nodes.append(base_service)
        
        
        tree = []
        
        # если передан параметр promotions, добавляем их в дерево услуг
        if not nocache or promotion:
            promotions = Promotion.objects.actual(ap.department.state)
            promotions_items = PromotionItem.objects.filter(promotion__in=promotions)
            promotions_dict = defaultdict(list)
            promotions_bs = {}
            for item in promotions_items.values('base_service__id','base_service__name','base_service__short_name'):
                promotions_bs[item['base_service__id']] = item
            
            for p in promotions_items:
                promotions_dict[p.promotion_id].append(p)
            
            if promotions.count():
                tree_node = {
                    'id':'promotions',
                    'text':u'Акции / Комплексные обследования',
                    'children':[promo_dict({'items':promotions_dict[promo.id],
                                            'id':promo.id,
                                            'name':promo.name,
                                            'discount_id':promo.discount_id,
                                            'total_price':promo.total_price}) \
                                 for promo in promotions],
                    'leaf':False,
                    'singleClickExpand':True
                }
                tree.append(tree_node)
        s = clear_tree(nodes,[])
        tree.extend(s)
        _cached_tree = simplejson.dumps(tree, cls=DjangoJSONEncoder)
        
        # кэш не обновляется, если есть параметр nocache
        if not nocache:
            cache.set(_cache_key, _cached_tree, 24*60*60*30)

    return _cached_tree

@gzip_page
def service_tree(request):
    resp = get_service_tree(request)
    cb = request.GET.get('cb')
    if cb:
        resp = u'%s(%s)' % (cb,resp)
    return HttpResponse(resp, mimetype="application/json")

from collections import defaultdict

def sampling_tree(request, visit_id):
    states = defaultdict(list)
    tree = []
    samplings = Sampling.objects.filter(visit__id=visit_id).order_by('laboratory__id',)
    for sampling in samplings:
        states[sampling.laboratory.__unicode__()].append(sampling)
    for k,v in states.iteritems():
        children = [{'id':item.id,'text':item.tube.name,'leaf':True} for item in v]
        node = {
            'id':k,
            'text':k,
            'leaf':False,
            'expanded':True,
            'children':children
        }
        tree.append(node)
    
    json = simplejson.dumps(tree)
        
    return HttpResponse(json, mimetype="application/json") 


def get_discounts(patient_id):
    """
    Возвращает список доступных скидок. Первой идет накопительная скидка, если она есть у клиента.
    """
    
    lookups = Q(accumulation=None)
    p = get_object_or_404(Patient, id=patient_id)
    if p.discount:
        lookups |= Q(id=p.discount_id)
    discounts = Discount.objects.filter(lookups).values('id','name','value')
    results = []
    for d in discounts:
        d['value'] = int(d['value'].normalize())
        results.append(d)
    return results

def discounts(request):
    patient_id = request.GET.get('pid')
    result = {'objects':get_discounts(patient_id)}
    return HttpResponse(simplejson.dumps(result), mimetype="application/json")


from elaphe.bwipp import barcode
from StringIO import StringIO

def barcodeimg(request):
    codetype = 'code39'
    codestring = str(request.GET.get('codestring'))
    bc = barcode(codetype, 
             codestring=codestring, 
             options={
                'height':0.5,
                'includetext':True,
                'textfont':'Verdana',
                'textyoffset':-9
            })
    tmp_file = StringIO()
    bc.save(tmp_file,'PNG')
    
    return HttpResponse(tmp_file.getvalue(),'image/png')


def get_groups(request):
    """
    """
    def tree_iterate(qs):
        """
        """
        nodes = []
        for item in qs.all().order_by(BaseService._meta.tree_id_attr, "-"+BaseService._meta.left_attr):
            if not item.is_leaf_node():
                node = {"id":item.id,
                        "text":item.short_name or item.name,
                        "leaf":True}
                children = tree_iterate(item.get_children())
                if children:
                    node['leaf'] = False
                    node['children'] = children 
                    node['singleClickExpand'] = True
                nodes.append(node)
        return nodes
    _cached_tree = None #cache.get('ancestors_list')
    if not _cached_tree:
        _cached_tree = simplejson.dumps(tree_iterate(BaseService.tree.root_nodes()))
        #cache.set('ancestors_list', _cached_tree, 60*60)
    
    return _cached_tree

@gzip_page
def groups(request):
    
    resp = get_groups(request)
    cb = request.GET.get('cb')
    if cb:
        resp = u'%s(%s)' % (cb,resp)
    
    return HttpResponse(resp,'application/json')



def children(request, parent_id=None):
    """
    """
    nodes = []

    def tree_iterate(qs):
        for item in qs.all().order_by(BaseService._meta.tree_id_attr, "-"+BaseService._meta.left_attr): #@UndefinedVariable
            nodes.append(item.id)
            if not item.is_leaf_node():
                tree_iterate(item.get_children())

    if parent_id:
        service = get_object_or_404(BaseService, id=parent_id)
        nodes.append(service.id)
        children = service.get_children()
    else:
        children = BaseService.tree.root_nodes()
    if children:
        tree_iterate(children)
        
    _cached_children = None
    
    if not _cached_children:
        _cached_children = simplejson.dumps(nodes)

    return HttpResponse(_cached_children, 'application/json')

@render_to('webapp/settings/app.js')
def js_settings(request):
    return {}
