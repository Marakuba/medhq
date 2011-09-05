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
    

@gzip_page
def price_list_helper(request):
    """
    """
    state = None
    by_state = request.GET.get('by_state', None)
    if by_state:
        state = get_object_or_404(State, id=request.GET.get('state', None))
        
    services = get_service_tree(state)
    
    st = State.objects.get(id=settings.MAIN_STATE_ID)
    #import pdb; pdb.set_trace()
    if request.GET.get('type')=='print':
        extra_context = {'services':services,
                         'exec_form':EXECUTION,
                         'state':state or st}
        return direct_to_template(request, "print/service/pricelist.html", extra_context=extra_context)
    
    elif request.GET.get('type')=='xls':
        
        wb = Workbook()
        
        ws = wb.add_sheet(u'Услуги клиники')
        #ws.insert_bitmap(settings.MEDIA_ROOT / 'resources' / 'images' / 'offlogo_w.bmp', 10, 2)
        
        fnt = Font()
        fnt.height = 240
        fnt.bold = True
        
        borders = Borders()
        borders.left = 2
        borders.right = 2
        borders.top = 2
        borders.bottom = 2
        
        title_al = Alignment()
        title_al.vert = Alignment.VERT_CENTER
        
        price_al = Alignment()
        price_al.horz = Alignment.HORZ_RIGHT
        
        ptrn = Pattern()
#        ptrn.pattern = Pattern.SOLID_PATTERN
        ptrn.back_colour = 'red'

        title_style = XFStyle()
        title_style.font = fnt
        title_style.borders = borders
        title_style.alignment = title_al
        title_style.pattern = ptrn
        
        service_style = XFStyle()
        service_style.borders = borders

        price_style = XFStyle()
        price_style.borders = borders
        price_style.alignment = price_al
        
        for i, service in enumerate(services):
            if service.is_leaf_node():
                ws.write(i,0, service.id, service_style)
                ws.write(i,1, service.name, service_style)
                ws.write(i,2, service.price(st), price_style)
            elif service.level in (0,1) and not service.is_leaf_node():
                ws.write_merge(i,i,0,2,service.name,title_style)
                ws.row(i).height=350
        ws.col(0).width = 1900
        ws.col(1).width = 20000
        ws.col(2).width = 1500
        myfile = StringIO.StringIO()
        wb.save(myfile)
        myfile.seek(0)
        response =  HttpResponse(myfile, mimetype='application/vnd.ms-excel')
        response['Content-Disposition'] = 'attachment; filename=EM_pricelist.xls' 
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
    if state:
        ignored = State.objects.filter(type='b').exclude(id=state.id)

    nodes = []
    for base_service in BaseService.objects.all().order_by(BaseService._meta.tree_id_attr, BaseService._meta.left_attr, 'level'): #@UndefinedVariable
        if base_service.is_leaf_node():
            items = base_service.extendedservice_set.active()
            if ignored:
                items = items.exclude(state__id__in=ignored)
                    
            if items.count():
                nodes.append(base_service)
        else:
            nodes.append(base_service)
            
    nodes = clear_tree(nodes,True)            
    return nodes
    