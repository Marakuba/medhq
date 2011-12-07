# -*- coding: utf-8 -*-

from django.contrib import admin

from models import *
from django.conf.urls.defaults import patterns
from django.shortcuts import get_object_or_404, render_to_response
from django.views.generic.list_detail import object_list
from django.template.context import RequestContext
from django import forms
from django.conf import settings
from django.utils.encoding import smart_unicode

class LabServiceInline(admin.TabularInline):
    """
    """
    model = LabService

class ResultInlineForm(forms.ModelForm):
    """
    """

    def __init__(self, *args, **kwargs):
        super(ResultInlineForm, self).__init__(*args, **kwargs)
        if self.instance.id:
            self.fields['input_list'].queryset = InputList.objects.filter(pk__in=self.instance.analysis.input_list.all())

    
    class Meta:
        model = Result


class ResultInline(admin.TabularInline):
    model = Result
    readonly_fields = ('presence','sample')
    extra = 0
    can_delete = False
    #exclude = ('presence',)
    fields = ('is_validated','value','input_list','test_form','to_print','sample')
    form = ResultInlineForm
    template = 'admin/lab/laborder/edit_inline/tabular.html'


def actions(obj):
    return "<a href='%sprint_results/' title='Распечатать' target='_blank'><img src='%sresources/images/1294430047_print.png' border='0'></a>" % (obj.get_absolute_url(), settings.STATIC_URL)
actions.short_description = u'Действия'
actions.allow_tags = True


class LabOrderAdmin(admin.ModelAdmin):
    
    readonly_fields = ('laboratory',)
    exclude = ('is_completed','is_printed','print_date','visit','lab_group')
#    list_display = ('__unicode__','is_completed','is_printed','print_date_display',actions)
    list_display = ('visit_id','visit_created','patient_name','visit_office','laboratory','operator','is_completed','is_printed','print_date_display',actions)
    list_filter = ('laboratory','is_completed','lab_group')
    date_hierarchy = 'created'
    inlines = [ResultInline]
    search_fields = ['visit__barcode__id','visit__patient__last_name']
    
    def visit_id(self, obj):
        return u"№%s" % obj.visit.barcode.id
    visit_id.short_description = u'Номер заказа'
    
    def visit_office(self, obj):
        return smart_unicode(obj.visit.office)
    visit_office.short_description = u'Офис'
    
    def visit_created(self, obj):
        return obj.visit.created.strftime("%d.%m.%Y / %H:%M")
    visit_created.short_description = u'Создано'
    
    def patient_name(self, obj):
        return obj.visit.patient.full_name()
    patient_name.short_description = u'Пациент'
        
    def print_order(self, request, object_id):
        """
        """
        order = get_object_or_404(LabOrder, pk=object_id)
        ec = {'order':order}
        return object_list(request, 
                           queryset=order.result_set.all(), 
                           template_name="admin/lab/laborder/print/order.html",
                           extra_context=ec)
    
    def print_results(self, request, object_id):
        """
        """
        
        order = get_object_or_404(LabOrder, pk=object_id)
        result_qs = Result.objects.filter(order=order, to_print=True).order_by('analysis__service__%s' % BaseService._meta.tree_id_attr, 
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
                group = ", ".join([node.__unicode__() for node in cur_service.get_ancestors()]) 
                if cur_group != group:
                    cur_group = group
                    result_list.append({'class':'group','object':cur_group}) 
                if set_len>1:
                    result_list.append({'class':'service','object':cur_service.__unicode__()})
            
            cls = result.is_completed() and 'result' or 'progress'
            result_list.append({'class':cls,'object':result})
                
        if set_len>1:
            result_list.append({'class':'blank','object':cur_service.gen_ref_interval or ' '})

        ec = {
                'order':order,
                'results':result_list
        }
        if order.is_completed and not order.print_date:
            order.is_printed = True
            order.print_date = datetime.datetime.now()
            order.save()
        return render_to_response("print/lab/results.html",
                                  ec,
                                  context_instance=RequestContext(request))
    
    def get_urls(self):
        urls = super(LabOrderAdmin, self).get_urls()
        my_urls = patterns('',
            (r'^(?P<object_id>\d+)/print_order/$', self.print_order),
            (r'^(?P<object_id>\d+)/print_results/$', self.print_results),
        )
        return my_urls + urls

    def save_formset(self, request, form, formset, change):
        """
        Given an inline formset save it to the database.
        """
#        if formset.model != Result:
#            return super(LabOrderAdmin, self).save_formset(request, form, formset, change)
        instances = formset.save(commit=True)
        
        flag = True
        lab_order = form.instance
        results = Result.objects.filter(order=lab_order)
        for result in results:
            flag = flag and result.is_validated
        lab_order.is_completed = flag
        lab_order.save()
    
#    def queryset(self, request):
#        qs = super(LabOrderAdmin, self).queryset(request)
#        return qs.filter(is_completed=True)


class AnalysisAdminForm(forms.ModelForm):
    
    #input_list = 
    
    class Meta:
        model = Analysis


class AnalysisAdmin(admin.ModelAdmin):
    """
    """
    exclude = ('input_mask',)
    search_fields = ['name',]
    formfield_overrides = {
        models.ManyToManyField: {'widget': forms.CheckboxSelectMultiple()},
    }
    
class ResultAdmin(admin.ModelAdmin):
    """
    """
    list_display = ('visit','analysis')
    
    def visit(self, obj):
        return obj.order.visit.__unicode__()
    search_fields = ('order__visit__id','order__visit__patient__last_name')
    ordering = ('-order',)
    
    
admin.site.register(Analysis, AnalysisAdmin)
admin.site.register(Sampling)
admin.site.register(InputList)
admin.site.register(Measurement)
admin.site.register(Tube)
admin.site.register(LabOrder,LabOrderAdmin)
admin.site.register(Result, ResultAdmin)
admin.site.register(Equipment)
admin.site.register(EquipmentAssay)
admin.site.register(EquipmentTask)
admin.site.register(EquipmentResult)
admin.site.register(Invoice)
admin.site.register(InvoiceItem)