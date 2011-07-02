# -*- coding: utf-8 -*-

from django.views.generic.simple import direct_to_template
from service.models import BaseService, EXECUTION
from service.forms import HelperFormSet
from django.http import HttpResponse
from state.models import State
from django.shortcuts import get_object_or_404
import StringIO

from xlwt import *
from django.conf import settings

def price_list_helper(request):
    """
    """
    state = get_object_or_404(State, id=request.GET.get('state', None))
    services = BaseService.objects.all().order_by(BaseService._meta.tree_id_attr, #@UndefinedVariable
                                                  'level', 
                                                  "-"+BaseService._meta.left_attr) #@UndefinedVariable
    st = State.objects.get(id=settings.MAIN_STATE_ID)
    if request.GET.get('type')=='print':
        extra_context = {'services':services,
                         'exec_form':EXECUTION,
                         'state':state}
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