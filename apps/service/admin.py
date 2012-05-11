# -*- coding: utf-8 -*-

from django import forms
from django.contrib import admin, messages

from feincms.admin.editor import TreeEditor
from mptt.forms import TreeNodeChoiceField

from models import BaseService
from lab.models import Analysis
from service.models import ExecutionPlace, Material, BaseServiceGroup,\
    LabServiceGroup, ExecutionTypeGroup, ExtendedService, ICD10, _clear_cache
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import simplejson
from django.conf.urls.defaults import patterns
import csv
import datetime
from django.db.models.expressions import F
from lab.admin import LabServiceInline
import StringIO

from pricelist.models import Price
from django.views.generic.simple import direct_to_template
from service.forms import PriceForm


class StandardServiceAdmin(TreeEditor):
    list_per_page = 1000
    ordering = ('code',)

#class StandardServiceAdmin(admin.ModelAdmin):
#    pass

class PriceInlineAdmin(admin.TabularInline):
    model = Price
    exclude = ('service','type')



class AnalysisInlineAdmin(admin.TabularInline):
    model = Analysis
    extra = 0
    exclude = ('input_mask','equipment_assay')


def is_leaf(obj):
    return obj.is_leaf_node()


def make_inactive_action(modeladmin, request, queryset):
    for s in queryset:
        dsc = s.get_descendants()
        for d in dsc:
            d.extendedservice_set.filter(is_active=True).update(is_active=False)
make_inactive_action.short_description = u'Сделать неактивной все дочерние услуги'

def iterate_service(service):
    """
    BaseService:
        parent
        name
        short_name
        code
        execution_time
        gen_ref_interval
        is_group
    ExtendedService:
        tube
        tube_count
        is_manual
    LabService:
        is_manual
        code
    Analysis:
        name
        code
        input_list
        measurement
        tube
        ref_range_text
        order
    
    item sample dump:
    
    [{
        'name':'abc',
        ....
        extended_service:[{
            'tube':'ssfdsdf'
            ...
        },...],
        lab_service:{
            'is_manual':False,
        },
        analysis:[{
            'name':'seerwwerwer',
            ...
        },...],
        children:[{....},...]
    },...]
    
    
    
    ************
    For loading:
    ************
    
    Required params:
        initial parent (root e.q. None),
        initial branch and/or ex.service state (by name or uuid),
        
    Options:
        make top service object (name,short_name) - wraps all items into new group
        
    """
    data = {
        'name':service.name,
        'short_name':service.short_name,
        'code':service.code,
        'execution_time':service.execution_time,
        'gen_ref_interval':service.gen_ref_interval,
        'is_group':service.is_group
    }
    extended_service = service.extendedservice_set.filter(is_active=True)
    if extended_service:
        data['extended_service'] = []
        for es in extended_service:
            data['extended_service'].append({
                'tube':es.tube and {
                    'name':es.tube.name,
                    'bc_count':es.tube.bc_count
                },
                'tube_count':es.tube_count,
                'is_manual':es.is_manual
            })
    try:
        lab_service = service.labservice
        if lab_service:
            data['lab_service'] = {
                'code':lab_service.code,
                'is_manual':lab_service.is_manual
            }
    except:
        pass
    
    analysis = service.analysis_set.all()
    if analysis:
        data['analysis'] = []
        for a in analysis:
            data['analysis'].append({
                'name':a.name,
                'code':a.code,
                'input_list':[il.name for il in a.input_list.all()],
                'measurement':a.measurement and a.measurement.name,
                'ref_range_text':a.ref_range_text,
                'order':a.order
            })
    
    children = service.get_children()
    if children:
        data['children'] = []
        for child in children:
            data['children'].append(iterate_service(child))
    
    return data
    
    

def dump_for_load(modeladmin, request, queryset):
    result = [iterate_service(s) for s in queryset]
    json_file = StringIO.StringIO()
    json_file.write(simplejson.dumps(result))
    json_file.seek(0)
    response =  HttpResponse(json_file, mimetype='application/json')
    response['Content-Disposition'] = 'attachment; filename=services_%s.json' % datetime.datetime.today()
    return response

class ExecutionPlaceAdmin(admin.TabularInline):
    
    model = ExecutionPlace
    extra = 1


class ExtendedServiceAdmin(admin.ModelAdmin):
    """
    """
    filter_horizontal = ('staff',)
    list_display = ('base_service','state', 'tube','tube_count','is_active','is_manual')
    diplay_links = ('base_service','state')
    search_fields = ('base_service__name',)
    list_filter = ('tube','state','is_manual')
    inlines = [PriceInlineAdmin]
    

class ExtendedServiceInlineAdmin(admin.TabularInline):
    
    template = "admin/service/tabular.html"
    model = ExtendedService
    extra = 1


lookups = {}
lookups[BaseService._meta.right_attr] = F(BaseService._meta.left_attr)+1

class BaseServiceForm(forms.ModelForm):
    
    name = forms.CharField(label=u'Полное наименование', required=True, max_length=300, 
                           widget=forms.TextInput(attrs={'size':100}))
    short_name = forms.CharField(label=u'Краткое наименование', required=False, max_length=300, 
                                 widget=forms.TextInput(attrs={'size':100}))
    parent = TreeNodeChoiceField(label=u'Группа', 
                                 queryset=BaseService.objects.exclude(base_group__isnull=True, **lookups).order_by(BaseService._meta.tree_id_attr, BaseService._meta.left_attr, 'level'), 
                                 required=False)
    
    class Meta:
        model = BaseService

class BaseServiceAdmin(TreeEditor):
    """
    """
    
    form = BaseServiceForm

    
    list_per_page = 2000
    list_display = ('name','short_name','code','execution_time','lab_group')
    list_editable = ('code','execution_time','lab_group')
    
    inlines = [ExtendedServiceInlineAdmin,AnalysisInlineAdmin,LabServiceInline]
    save_as = True
    exclude = ('standard_service','normal_tubes','transport_tubes','staff','individual_tube')
    search_fields = ['name','short_name','code']
    actions = [make_inactive_action,dump_for_load]

    def pricelist(self, request):
        form = PriceForm()
        extra_context = {'today':datetime.date.today().strftime("%d.%m.%Y"),'form' : form}
        return direct_to_template(request, "admin/service/pricelist.html", extra_context=extra_context)
        
    def pricelist_print(self, request):
        date = request.GET.get('date')
        if not date:
            date = datetime.datetime.today()
        if not isinstance(date, datetime.datetime):
            date = datetime.datetime.strptime(date, "%d.%m.%Y")
        print date
        services = BaseService.objects.actual().order_by(BaseService._meta.tree_id_attr, #@UndefinedVariable
                                                      'level', 
                                                      "-"+BaseService._meta.left_attr) #@UndefinedVariable
        
        extra_context = {
                            'services':services,
                            'date':date
                        }
        return direct_to_template(request, "print/service/pricelist.html", extra_context=extra_context)
        
    def export_csv(self, request):
        response =  HttpResponse(mimetype='text/csv')
        writer = csv.writer(response)
        qs = self.queryset(request).order_by(self.model._meta.tree_id_attr, self.model._meta.left_attr)
        for obj in qs:
            row = [obj.id, 
                   obj.parent_id, 
                   obj.name.encode("utf-8"), 
                   obj.short_name.encode("utf-8")
                   ]
            writer.writerow(row)
        response['Content-Disposition'] = 'attachment; filename=services_%s.csv' % datetime.datetime.today()
        return response
    
    def clear_cache(self, request):
        
        _clear_cache()
        messages.info(request, u'Кэш услуг был успешно очищен!')
        back_url = request.META['HTTP_REFERER'] or '/admin/'
        
        return HttpResponseRedirect(back_url)
    
    def get_urls(self):
        urls = super(BaseServiceAdmin, self).get_urls()
        my_urls = patterns('',
            (r'^export/csv/$', self.export_csv),
            (r'^pricelist/$', self.pricelist),
            (r'^pricelist/print/$', self.pricelist_print),
            (r'^clear_cache/$', self.clear_cache),
        )
        return my_urls + urls


    

admin.site.register(BaseService, BaseServiceAdmin)
admin.site.register(ExtendedService, ExtendedServiceAdmin)
admin.site.register(Material)
admin.site.register(BaseServiceGroup)
admin.site.register(LabServiceGroup)
admin.site.register(ExecutionTypeGroup)
admin.site.register(ICD10)

