# -*- coding: utf-8 -*-

from django.contrib import admin, messages

from models import *
from django.conf.urls.defaults import patterns
from django.shortcuts import get_object_or_404, render_to_response
from django.views.generic.list_detail import object_list
from django.template.context import RequestContext
from django import forms
from django.conf import settings
from django.utils.encoding import smart_unicode
from lab.fields import EqAnlModelChoiceField
from django.http import HttpResponseRedirect
from remoting.utils import update_result_feed
from lab.forms import AnalysisCopierForm

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


def update_specimen_action(modeladmin, request, queryset):
    """
    """
    states = {}
    for obj in queryset:
        try:
            state = obj.laboratory.remotestate
            k = state.secret_key
            if k not in states:
                states[k] = []
        except Exception, err:
            # print err
            continue
        specimen = obj.visit.specimen
        if specimen not in states[k]:
            states[k].append(specimen)
    
    for secret_key,specimens in states.iteritems():
        update_result_feed(state_key=secret_key, specimens=specimens)
        
update_specimen_action.short_description = u"Загрузить результаты"

class LabOrderAdmin(admin.ModelAdmin):
    
    readonly_fields = ('laboratory',)
    exclude = ('is_completed','is_printed','print_date','visit')
#    list_display = ('__unicode__','is_completed','is_printed','print_date_display',actions)
    list_display = ('visit_id','visit_created','patient_name','visit_office','laboratory','operator','is_completed','is_printed','print_date_display','created_date','lab_group')
    list_filter = ('laboratory','is_completed','lab_group')
    date_hierarchy = 'created'
    inlines = [ResultInline]
    actions = [update_specimen_action]
    search_fields = ['visit__barcode__id','visit__patient__last_name']
    
    def created_date(self, obj):
        return obj.created.strftime('%d.%m.%y / %H:%M:%S')
    created_date.short_description = u'Создан'
    
    def visit_id(self, obj):
        return u"№%s" % obj.visit.barcode_id
    visit_id.short_description = u'Номер заказа'
    
    def visit_office(self, obj):
        return smart_unicode(obj.visit.office)
    visit_office.short_description = u'Офис'
    
    def visit_created(self, obj):
        return obj.visit.created.strftime("%d.%m.%y / %H:%M")
    visit_created.short_description = u'Дата заказа'
    
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

#    def save_formset(self, request, form, formset, change):
#        """
#        Given an inline formset save it to the database.
#        """
##        if formset.model != Result:
##            return super(LabOrderAdmin, self).save_formset(request, form, formset, change)
#        instances = formset.save(commit=True)
#        
#        flag = True
#        lab_order = form.instance
#        results = Result.objects.filter(order=lab_order)
#        for result in results:
#            flag = flag and result.is_validated
#        lab_order.is_completed = flag
#        lab_order.save()
    
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
    exclude = ('input_mask','tube')
    search_fields = ['name',]
    filter_horizontal = ['input_list',]
    list_display = ('name','code','ref_range_text')
    formfield_overrides = {
        models.ManyToManyField: {'widget': forms.CheckboxSelectMultiple()},
    }

    def analysis_copier(self, request):
        if request.method=='POST':
            form = AnalysisCopierForm(request.POST)
            if form.is_valid():
                src = form.cleaned_data['src']
                dst = form.cleaned_data['dst']
                for analysis in src.analysis_set.all():
                    new_analysis = Analysis.objects.create(
                        service=dst,
                        profile=analysis.profile,
                        name=analysis.name,
                        code=analysis.code,
                        measurement=analysis.measurement,
                        ref_range_text=analysis.ref_range_text,
                        order=analysis.order,
                        by_age=analysis.by_age,
                        by_gender=analysis.by_gender,
                        by_pregnancy=analysis.by_pregnancy,
                        hidden=analysis.hidden
                    )
                    for input_list in analysis.input_list.all():
                        new_analysis.input_list.add(input_list)
                return HttpResponseRedirect('/admin/lab/analysis/analysis_copier/')
        else:
            form = AnalysisCopierForm()
        
        ec = {
            'form':form
        }
        
        return render_to_response('admin/lab/analysis_copier.html', ec,
                                  context_instance=RequestContext(request))
        
    def get_urls(self):
        urls = super(AnalysisAdmin, self).get_urls()
        custom_urls = patterns('',
            (r'^analysis_copier/$', self.analysis_copier),
        )
        return custom_urls + urls

    
def separate(modeladmin, request, queryset):
    """
    """
    orders = list(set(queryset.values_list('order', flat=True)))
    if len(orders)>1:
        messages.warning(request, u'Исследования должны быть из одного лабораторного ордера!')
        return HttpResponseRedirect(request.get_full_path())
    
    result = queryset[0]
    o = result.order
    laborder = LabOrder.objects.create(visit=o.visit,  
                                        laboratory=o.laboratory,
                                        lab_group=o.lab_group,
                                        is_manual=o.is_manual,
                                        widget=o.widget,
                                        manual_service=o.manual_service)
    queryset.update(order=laborder)
    messages.info(request, u'Исследования были успешно перенесены в лабораторный ордер #%s' % laborder.id)
        
separate.short_description = u'Отделить в новый лабораторный ордер'
    
    
class ResultAdmin(admin.ModelAdmin):
    """
    """
    list_display = ('visit','order','analysis','modified','modified_by')
    readonly_fields = ('visit','order','analysis','sample')
    search_fields = ('order__visit__barcode__id','order__visit__patient__last_name','analysis__service__short_name')
    ordering = ('-order__visit__barcode__id',)
    actions = [separate]
    
    
    def visit(self, obj):
        return obj.order.visit.__unicode__()

class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('name','serial_number','order','is_active')
    
class EquipmentAssayAdmin(admin.ModelAdmin):
    list_display = ('equipment_analysis','name','code','def_protocol','equipment','is_active')
    list_filter = ('equipment','is_active')
    list_editable = ('def_protocol',)
    exclude = ('service',)
    formfield_overrides = {
        models.TextField: {'widget': forms.TextInput()},
    }
        
def set_to_wait(modeladmin, request, queryset):
    queryset.update(status=u'wait')
    
class EquipmentTaskAdmin(admin.ModelAdmin):
    list_display = ('visit_id','service_name','result','status','created')
    list_filter = ('status',)
    readonly_fields = ('ordered_service','result')
    search_fields = ['ordered_service__order__barcode__id',]
    actions = [set_to_wait]
    
    def service_name(self, obj):
        return obj.ordered_service.service
    
    def visit_id(self, obj):
        return obj.ordered_service.order.barcode_id
    
class EquipmentResultAdmin(admin.ModelAdmin):
    list_display = ('created','specimen','eq_serial_number','assay_name','assay_code','assay_protocol','abnormal_flags','result_type','result_status','result')
    search_fields = ['specimen','assay_name']
    
    
eq_analysis_qs = Analysis.objects.filter(service__isnull=False) \
    .order_by('service__short_name')

class EquipmentAnalysisAdminForm(forms.ModelForm):
    
    analysis = EqAnlModelChoiceField(label="Тест",
                                           queryset=eq_analysis_qs, 
                                           required=True)
    
    class Meta:
        model = EquipmentAnalysis
    
class EquipmentAnalysisAdmin(admin.ModelAdmin):
    """
    """
    form = EquipmentAnalysisAdminForm
    
class SamplingAdmin(admin.ModelAdmin):
    """
    """
    list_display = ('barcode','tube','laboratory','is_barcode')
    
    def barcode(self, obj):
        return obj.visit.barcode_id


class LabOrderEmailTaskAdmin(admin.ModelAdmin):
    """
    """
    readonly_fields = ['lab_order', ]


class LabOrderEmailHistoryAdmin(admin.ModelAdmin):
    """
    """
    readonly_fields = ['email_task', ]
    list_display = ['id','email_task','created','status']


admin.site.register(AnalysisProfile)
admin.site.register(Analysis, AnalysisAdmin)
admin.site.register(Sampling, SamplingAdmin)
admin.site.register(InputList)
admin.site.register(Measurement)
admin.site.register(Tube)
admin.site.register(LabOrder, LabOrderAdmin)
admin.site.register(Result, ResultAdmin)
admin.site.register(Equipment, EquipmentAdmin)
admin.site.register(EquipmentAnalysis, EquipmentAnalysisAdmin)
admin.site.register(EquipmentAssay, EquipmentAssayAdmin)
admin.site.register(EquipmentTask, EquipmentTaskAdmin)
admin.site.register(EquipmentResult, EquipmentResultAdmin)
admin.site.register(Invoice)
admin.site.register(InvoiceItem)
admin.site.register(LabOrderEmailTask, LabOrderEmailTaskAdmin)
admin.site.register(LabOrderEmailHistory, LabOrderEmailHistoryAdmin)
