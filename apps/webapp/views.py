# -*- coding: utf-8 -*-
from django.utils import simplejson
from django.http import HttpResponse, HttpResponseRedirect
from service.models import BaseService
from django.db import connection
from django.core.cache import cache
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

            try:
                profile = user.get_profile()
                active_profile = profile.position_set.all()[0]
                response['redirect_to'] = u'/webapp/setactiveprofile/%d/' % active_profile.id
            except Exception, err:
                print err
                pass
            
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
    return {}

    
@login_required
@render_to('webapp/registry/index.html')
def registry(request):
    return {}
    

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
    return {}
    

@login_required
@render_to('webapp/laboratory/index.html')
def laboratory(request):
    return {}

@login_required
@render_to('webapp/examination/index.html')
def examination(request):
    return {}
    

def get_service_tree():
    """
    Генерирует дерево в json-формате.
    """
    def tree_iterate(qs):
        nodes = []
        for base_service in qs.all().order_by(BaseService._meta.tree_id_attr, "-"+BaseService._meta.left_attr): #@UndefinedVariable
            if base_service.is_leaf_node():
                """
                """
                for item in base_service.extendedservice_set.active():
                    price = item.get_actual_price()
                    if price:
                        node = {
                            "id":'%s-%s' % (base_service.id,item.state.id),
                            "text":"%s [%s]" % (base_service.short_name or base_service.name, price),
                            "leaf":True,
                            "cls":"multi-line-text-node",
                            "price":price,
                            #"place":,
                            "iconCls":"ex-place-%s" % item.state.id
                        }
                        staff_all = item.staff.all()
                        if staff_all.count():
                            node['staff'] = [(pos.id,pos.__unicode__()) for pos in item.staff.all()]
                        
                        nodes.append(node)

            else:
                """
                """
                node = {
                    'id':base_service.id,
                    'text': "%s" % (base_service.short_name or base_service.name,),
                    'children':tree_iterate(base_service.get_children()),
                    'leaf':False,
                    'singleClickExpand':True
                }
                nodes.append(node)
                
        return nodes
    
    _cached_tree = cache.get('x-service_list')
    if not _cached_tree:
        tree = tree_iterate(BaseService.tree.root_nodes()) #@UndefinedVariable
        _cached_tree = simplejson.dumps(tree)
        cache.set('x-service_list', _cached_tree, 24*60*60*30)

    return _cached_tree

@gzip_page
def service_tree(request):
    _cached_tree = get_service_tree()
    return HttpResponse(_cached_tree, mimetype="application/json")

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


def groups(request):
    """
    """
    def tree_iterate(qs):
        """
        """
        nodes = []
        for item in qs.filter(is_active=True).order_by(BaseService._meta.tree_id_attr, "-"+BaseService._meta.left_attr):
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
    
    return HttpResponse(_cached_tree,'application/json')



def children(request, parent_id=None):
    """
    """
    nodes = []

    def tree_iterate(qs):
        for item in qs.filter(is_active=True).order_by(BaseService._meta.tree_id_attr, "-"+BaseService._meta.left_attr): #@UndefinedVariable
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