# -*- coding: utf-8 -*-

from django.views.generic.simple import direct_to_template
from service.models import BaseService, EXECUTION
from service.forms import HelperFormSet, StaffForm
from django.http import HttpResponse, HttpResponseRedirect,\
    HttpResponseBadRequest
from state.models import State
from django.shortcuts import get_object_or_404
import StringIO

from xlwt import *
from django.conf import settings
from annoying.decorators import render_to
from django.views.decorators.gzip import gzip_page
from pricelist.models import Price
from django.db.models import Max
from constance import config
from staff.models import Position

def pricelist(request):

    """
    """
    state = get_object_or_404(State, id=request.GET.get('state', None))
    services = BaseService.objects.all().order_by(BaseService._meta.tree_id_attr, BaseService._meta.left_attr, 'level')
    nodes = []
    for service in services:
        if service.is_leaf_node():
            node = {
                'id':service.id,
                'name':service.name,
                'level':service.level,
                'leaf':True
            }
            nodes.append(node)
        else:
            node = {
                'name':service.name,
                'level':service.level,
                'leaf':False
            }
            nodes.append(node)
    extra_context = {
        'services':nodes
    }
    return direct_to_template(request, "print/service/fullpricelist.html", extra_context=extra_context)
    

def price_list_helper(request):
    """
    """
    
    import sys
    
    sys.setrecursionlimit(3000)
    
    state = None
    by_state = request.GET.get('by_state', None)
    if by_state:
        try:
            state = get_object_or_404(State, id=request.GET.get('state', None))
        except:
            state = None
            
    services = get_service_tree(state)
    
    st = State.objects.get(id=settings.MAIN_STATE_ID)

    if request.GET.get('type')=='print':
        extra_context = {'services':services,
                         'exec_form':EXECUTION,
                         'state':state or st}
        return direct_to_template(request, "print/service/pricelist.html", extra_context=extra_context)
    
    elif request.GET.get('type')=='xls':
        
        wb = Workbook()
        
        ws = wb.add_sheet(u'Услуги клиники')
        #ws.insert_bitmap(settings.MEDIA_ROOT / 'resources' / 'images' / 'offlogo_w.bmp', 10, 2)
        
#        fnt = Font()
#        fnt.height = 240
#        fnt.bold = True
#        
#        borders = Borders()
#        borders.left = 2
#        borders.right = 2
#        borders.top = 2
#        borders.bottom = 2
#        
#        title_al = Alignment()
#        title_al.vert = Alignment.VERT_CENTER
#        
#        price_al = Alignment()
#        price_al.horz = Alignment.HORZ_RIGHT
#        
#        ptrn = Pattern()
##        ptrn.pattern = Pattern.SOLID_PATTERN
#        ptrn.back_colour = 'red'
#
#        title_style = XFStyle()
#        title_style.font = fnt
#        title_style.borders = borders
#        title_style.alignment = title_al
#        title_style.pattern = ptrn
#        
#        service_style = XFStyle()
#        service_style.borders = borders
#
#        price_style = XFStyle()
#        price_style.borders = borders
#        price_style.alignment = price_al


        ws.row(0).height = 1500
        
        fnt = Font()
        fnt.name = 'Impact'
        fnt.height = 400
        fnt.colour_index = 58
#        fnt.bold = True        
        
        alg = Alignment()
        alg.vert = Alignment.VERT_CENTER
        
        head_style = XFStyle()
        head_style.font = fnt
        head_style.alignment = alg

        ws.write_merge(0,0,1,3,state and state.official_title or config.BRAND, head_style)
        
####### Headers
        
        fnt = Font()
        fnt.height = 240
        fnt.bold = True        
        
        head_style = XFStyle()
        head_style.font = fnt

        if state:        
            ws.write_merge(3,3,0,1,u"""%s
    телефон: %s
    факс: %s
    email: %s""" % ( state.address_street, state.phones, state.fax, state.email), head_style)
    
            alg = Alignment()
            alg.horz = Alignment.HORZ_RIGHT
            
            head_style.alignment = alg 
            ws.write_merge(3,3,2,3,u"""Утверждаю
    ________________________
    %s
    %sг.""" % (state.official_title, request.GET.get('date')), head_style)
            ws.row(3).height = 1200
        
        
        
        fnt = Font()
        fnt.name = 'Calibri'
        fnt.height = 380
        fnt.bold = True        

        alg = Alignment()
        alg.vert = Alignment.VERT_CENTER
        alg.horz = Alignment.HORZ_CENTER
        
        head_style = XFStyle()
        head_style.font = fnt        
        head_style.alignment = alg

        
        ws.write_merge(7,7,0,3,u'Прейскурант цен',head_style)
        ws.row(7).height = 480

        fnt = Font()
        fnt.name = 'Calibri'
        fnt.height = 220
        fnt.bold = True        
        fnt.colour_index = 1

        alg = Alignment()
        alg.wrap = Alignment.WRAP_AT_RIGHT
        alg.vert = Alignment.VERT_CENTER
        alg.horz = Alignment.HORZ_CENTER

        ptrn = Pattern()
        ptrn.pattern = Pattern.SOLID_PATTERN
        ptrn.pattern_fore_colour = 17

        head_style = XFStyle()
        head_style.font = fnt         
        head_style.alignment = alg
        head_style.pattern = ptrn
        
        ws.write(8,0,u'Код услуги',head_style)
        ws.write_merge(8,8,1,2,u'Наименование услуги',head_style)
        ws.write(8,3,u'Цена',head_style)
        
        ws.row(8).height = 620
#### COLORS



#### SERVICES
        
        fnt = Font()
        fnt.height = 240
        fnt.bold = True
        
        borders = Borders()
        borders.left = 1
        borders.right = 1
        borders.top = 1
        borders.bottom = 1
        
        title_al = Alignment()
        title_al.vert = Alignment.VERT_CENTER
        
        price_al = Alignment()
        price_al.horz = Alignment.HORZ_RIGHT
        
        ptrn = Pattern()
        ptrn.pattern = Pattern.SOLID_PATTERN
        ptrn.pattern_fore_colour = 3

        title_style = XFStyle()
        title_style.font = fnt
        title_style.borders = borders
        title_style.alignment = title_al
        title_style.pattern = ptrn
        
        
        s_align = Alignment()
        s_align.wrap = Alignment.WRAP_AT_RIGHT
        s_align.vert = Alignment.VERT_CENTER
        s_align.horz = Alignment.HORZ_LEFT
                
        service_style = XFStyle()
        service_style.borders = borders
        service_style.alignment = s_align

        price_style = XFStyle()
        price_style.borders = borders
        price_style.alignment = price_al
        
        cursor = 9


        
        for i, service in enumerate(services):
            if service[0].is_leaf_node() and service[1]:
                ws.write(cursor,0, service[0].id, service_style)
                ws.write_merge(cursor,cursor,1,2, service[0].name, service_style)
                ws.write(cursor,3, service[1], price_style)
            else:
                ws.write_merge(cursor,cursor,0,3,service[0].name,title_style)
                ws.row(cursor).height=350
            cursor +=1
            
        ws.col(0).width = 1900
        ws.col(1).width = 20000
        ws.col(2).width = 1500
        myfile = StringIO.StringIO()
        wb.save(myfile)
        myfile.seek(0)
        response =  HttpResponse(myfile, mimetype='application/vnd.ms-excel')
        response['Content-Disposition'] = 'attachment; filename=pricelist.xls' 
        return response



def service_list(request):
    """
    """

    services = BaseService.objects.actual().filter(base_group__id=4).order_by(BaseService._meta.tree_id_attr, #@UndefinedVariable
                                                  'level', 
                                                  "-"+BaseService._meta.left_attr) #@UndefinedVariable
    
    extra_context = {'services':services}
    return direct_to_template(request, "helpers/service/list.html", extra_context=extra_context)


@render_to('helpers/service/staff_setter.html')
def staff_setter(request):
    
    if request.method=="POST":
        form = StaffForm(request.POST)
        if form.is_valid():
            services = form.cleaned_data['service']
            for service in services:
                service.staff.clear()
                service.staff.add(*form.cleaned_data['staff'])
            return HttpResponseRedirect('/helper/staffsetter/')
        else:
            print "form is not valid"
            return HttpResponseBadRequest('form is invalid!')
            
    else:
        form = StaffForm()
    
    c = {'form':form}
    
    return c

def get_service_tree(state=None):
    """
    Генерирует дерево в json-формате.
    """
    def clear_tree(tree=[],empty=False):
        '''
        Рекурсивно очищает список, содержащий дерево, от пустых групп
        empty - признак того, есть ли в текущей группе элементы
        '''
        #Если список пуст, удалять больше нечего
        if len(tree)==0:
            return []
        else:
            node = tree[-1]
            if (empty or node.is_root_node()) and not node.is_leaf_node():
                #Если это не группа или один из корней, то говорим, что потомков нет
                tree = clear_tree(tree[:-1],True) or []
            else:
                tree = clear_tree(tree[:-1],False) or []
            #Если нет потомков и текущий элемент - группа
            if not node.is_leaf_node() and empty:
                #удаляем текущий элемент
                node = None
            if node:
                tree.append(node)
            return tree 
            
    ignored = None
    args = {}
    if state:
        ignored = State.objects.filter(type='b').exclude(id=state.id)
        args['extended_service__state']=state.id

    nodes = []
    values = Price.objects.filter(extended_service__is_active=True, price_type='r',**args).\
        order_by('extended_service__id').\
        values('extended_service__id','value','extended_service__base_service__id').\
        annotate(Max('on_date'))
    result = {}
    for val in values:
        result[val['extended_service__base_service__id']] = val
    for base_service in BaseService.objects.all().order_by(BaseService._meta.tree_id_attr, BaseService._meta.left_attr, 'level'): #@UndefinedVariable
        if base_service.is_leaf_node():
            if result.has_key(base_service.id):
                nodes.append(base_service)
        else:
            nodes.append(base_service)
            
    mass = []        
    nodes = clear_tree(nodes,True)
    for node in nodes:
        if result.has_key(node.id):
            k = [node,result[node.id]['value'] or None]
        else:
            k = [node,None]
        mass.append(k)   
    #import pdb; pdb.set_trace()
    return mass