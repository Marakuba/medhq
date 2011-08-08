# -*- coding: utf-8 -*-

from django import forms
from django.contrib import admin
from django.conf import settings
from django.core.cache import cache

from feincms.admin.editor import TreeEditor
from mptt.forms import TreeNodeChoiceField

from models import BaseService, StandardService, ICD10
from pricelist.models import Price
from lab.models import Analysis, Tube
from state.models import State
from service.models import ExecutionPlace, Material, BaseServiceGroup,\
    LabServiceGroup, ExecutionTypeGroup, ExtendedService, ICD10
from django.http import HttpResponseBadRequest, HttpResponse
from django.utils.safestring import mark_safe
from django.utils import simplejson
from feincms.admin.tree_editor import _build_tree_structure
from django.conf.urls.defaults import patterns
import csv
import datetime
from django.views.generic.simple import direct_to_template


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
    exclude = ('input_mask',)


def is_leaf(obj):
    return obj.is_leaf_node()

#def is_lab(obj):
#    return obj.is_lab and u'Да' or u'Нет'
#is_lab.short_description = u'Лаборатория'


def add_tube(tube_pk, queryset):
    tube = Tube.objects.get(pk=tube_pk)
    for obj in queryset:
        for analysis in obj.analysis_set.all():
            if not tube in analysis.tube.all():
                analysis.tube.add(tube)

def red_tube(modeladmin, request, queryset):
    add_tube(2, queryset)
red_tube.short_description = u'Добавить красную пробирку'

def violete_tube(modeladmin, request, queryset):
    add_tube(4, queryset)
violete_tube.short_description = u'Добавить фиолетовую пробирку'

def green_tube(modeladmin, request, queryset):
    add_tube(7, queryset)
green_tube.short_description = u'Добавить зеленую пробирку'

def blue_tube(modeladmin, request, queryset):
    add_tube(5, queryset)
blue_tube.short_description = u'Добавить голубую пробирку'

def more_violete_tube(modeladmin, request, queryset):
    add_tube(18, queryset)
more_violete_tube.short_description = u'Добавить дополнительную фиолетовую пробирку'

TUBES = (
    (2,u'Добавить красную пробирку'),
    (4,u'Добавить фиолетовую пробирку'),
    (7,u'Добавить зеленую пробирку'),
    (5,u'Добавить голубую пробирку'),
    (18,u'Добавить дополнительную фиолетовую пробирку'),
)


def make_cons_action(modeladmin, request, queryset):
    queryset.update(execution_form=u'к')
make_cons_action.short_description = u'Вид исполнения: консультативная услуга'

def make_proc_action(modeladmin, request, queryset):
    queryset.update(execution_form=u'п')
make_proc_action.short_description = u'Вид исполнения: процедурный кабинет'

def make_other_action(modeladmin, request, queryset):
    queryset.update(execution_form=u'д')
make_other_action.short_description = u'Вид исполнения: другой'

def make_inactive_action(modeladmin, request, queryset):
    queryset.update(is_active=False)
make_inactive_action.short_description = u'Сделать неактивной'

def make_is_lab_action(modeladmin, request, queryset):
    queryset.update(is_lab=True)
make_is_lab_action.short_description = u'Включать в направления'

def unmake_is_lab_action(modeladmin, request, queryset):
    queryset.update(is_lab=False)
unmake_is_lab_action.short_description = u'Не включать в направления'



#pl = {u'Ек':State.objects.get(name=u"Евромед (КИМ)"),
#      u'Ел':State.objects.get(name=u"Евромед (Лузана)"),
#      u'К':State.objects.get(name=u"КЛЦ"),
#      u'Д':State.objects.get(name=u"ДЦ")}

#def make_place_column(symbol):
#    def em_lab(obj):
#        result = obj.execution_place.filter(id=pl[symbol].id)
#        return len(result) and u"<img src='/media/resources/images/state_%s.png' title='%s'>" % (pl[symbol].id, pl[symbol].name) or u""
#    
#    em_lab.short_description = pl[symbol]
#    em_lab.allow_tags = True
#    return em_lab


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
    
    model = ExtendedService
    extra = 1

class BaseServiceForm(forms.ModelForm):
    
    parent = TreeNodeChoiceField(label=u'Группа', 
                                 queryset=BaseService.objects.filter(level=0), 
                                 required=False)
    
    class Meta:
        model = BaseService

class BaseServiceAdmin(TreeEditor):
    """
    """

#    class Media:
#        css = {
#            "all": (settings.MEDIA_URL + "jquery/jquery-ui-1.8.custom.css",)
#        }
#        js = (settings.MEDIA_URL + "jquery/jquery-1.4.2.min.js",
#              settings.MEDIA_URL + "jquery/jquery.cookie.js",
#              settings.MEDIA_URL + "jquery/jquery.ui.core.js",
#              settings.MEDIA_URL + "jquery/jquery.ui.widget.js",
#              settings.MEDIA_URL + "jquery/jquery.ui.tabs.js",
#              "resources/js/csv_button.js")
    
    list_per_page = 1200
    #change_form_template = "admin/tabbed/change_form.html"
    list_display = ('name','short_name',
                    #make_place_column(u'Ек'),make_place_column(u'Ел'),make_place_column(u'К'),make_place_column(u'Д'),
                    #'execution_time',
                    'execution_form')
    inlines = [ExtendedServiceInlineAdmin,AnalysisInlineAdmin]
    #filter_horizontal = ('staff',)
    save_as = True
    exclude = ('standard_service','normal_tubes','transport_tubes','staff','individual_tube')
    search_fields = ['name','short_name']
    actions = [red_tube, violete_tube, green_tube, blue_tube, more_violete_tube,
               make_cons_action, make_proc_action, make_other_action, make_inactive_action,
               make_is_lab_action, unmake_is_lab_action]
    
    def export_csv(self, request):
        response =  HttpResponse(mimetype='text/csv')
        writer = csv.writer(response)
        qs = self.queryset(request).order_by(self.model._meta.tree_id_attr, self.model._meta.left_attr)
        for object in qs:
            row = [object.id, 
                   object.parent_id, 
                   object.name.encode("utf-8"), 
                   object.short_name.encode("utf-8")
                   ]
            writer.writerow(row)
        response['Content-Disposition'] = 'attachment; filename=services_%s.csv' % datetime.datetime.today()
        return response
    
    def pricelist(self, request):
        extra_context = {'today':datetime.date.today().strftime("%d.%m.%Y")}
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
        
    def tests(self, request):
        services = BaseService.objects.actual().order_by(BaseService._meta.tree_id_attr, #@UndefinedVariable
                                                      'level', 
                                                      "-"+BaseService._meta.left_attr) #@UndefinedVariable
        
        extra_context = {'services':services}
        return direct_to_template(request, "print/service/tests.html", extra_context=extra_context)
        
    def get_urls(self):
        urls = super(BaseServiceAdmin, self).get_urls()
        my_urls = patterns('',
            (r'^export/csv/$', self.export_csv),
            (r'^pricelist/$', self.pricelist),
            (r'^pricelist/print/$', self.pricelist_print),
            (r'^tests/$', self.tests),
        )
        return my_urls + urls

    

#admin.site.register(StandardService, StandardServiceAdmin)
admin.site.register(BaseService, BaseServiceAdmin)
admin.site.register(ExtendedService, ExtendedServiceAdmin)
admin.site.register(Material)
admin.site.register(BaseServiceGroup)
admin.site.register(LabServiceGroup)
admin.site.register(ExecutionTypeGroup)
admin.site.register(ICD10)


#admin.site.register(ICD10)
