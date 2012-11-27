# -*- coding: utf-8 -*-

from django.contrib import admin

from models import Visit, OrderedService
from django import forms
from state.models import State
from staff.models import Staff
from service.models import BaseService
from django.conf.urls.defaults import patterns, url
from django.views.generic.simple import direct_to_template
from django.shortcuts import get_object_or_404
from visit.models import Referral, PlainVisit, ReferralVisit, ReferralAgent
from django.http import HttpResponse
import StringIO
import csv
from django.conf import settings
from reversion.admin import VersionAdmin
from selection.fields import ModelChoiceField
from patient.models import Contract, InsurancePolicy
from django.views.generic.list_detail import object_list
from selection.views import selection


queryset = Referral.objects.all()
selection.register('referral', queryset, 'list', paginate_by=50)


class OrderedServiceForm(forms.ModelForm):
    
    service = ModelChoiceField('service', label=u'Услуга')
    
    class Meta:
        model = OrderedService


class OrderedServiceAdmin(admin.TabularInline):
    model = OrderedService
    fields = ('service','execution_place','staff','count')
    extra = 0
    #form = OrderedServiceForm
    
class OrderedServiceFullAdmin(admin.StackedInline):
    model = OrderedService
    fields = ('service','execution_place','executed','print_date','staff','count','price','total_price','operator')
    extra = 0
    form = OrderedServiceForm
    
state_qs = State.objects.filter(type=u'j')
base_service_qs = BaseService.objects.all()

class VisitForm(forms.ModelForm):
    """
    """
    referral = ModelChoiceField('referral', label=u'Кто направил', required=False)
    
    def __init__(self, *args, **kwargs):
        super(VisitForm, self).__init__(*args, **kwargs)
        if self.instance.id:
            self.fields['contract'].queryset = Contract.objects.filter(patient=self.instance.patient)
            self.fields['insurance_policy'].queryset = InsurancePolicy.objects.filter(patient=self.instance.patient)

    
    class Meta:
        model = Visit
       
lab_qs = State.objects.filter(type__in=(u'm',u'b'))     
class IncomeForm(VisitForm):
    """
    """
    source_lab = forms.ModelChoiceField(queryset=lab_qs,
                                        required=True, label=u'Лаборатория')

def actions(obj):
    return u"<a href='%sprint/' title='Распечатать' target='_blank'><img src='%sresources/images/1294430047_print.png' border='0'></a>" % (obj.get_absolute_url(), settings.STATIC_URL)
actions.short_description = u'Печать'
actions.allow_tags = True

def discount_value(obj):
    if obj.discount:
        return u"%s" % obj.discount.value
    return "---"
discount_value.short_description = u'Скидка'

        
def export_into_1c(modeladmin, request, queryset):
    #response =  HttpResponse(mimetype='text/csv')
    tmp_file = StringIO.StringIO()
    tmp_file.write(u'Начало выгрузки\n'.encode("windows-1251"))
    tmp_file.write(u'Количество документов:%s\n'.encode("windows-1251") % len(queryset))
    #rows = []
    #rows.append([u'Начало выгрузки'])
    #rows.append(u'Количество документов:%s' % len(queryset))
    #[print s.encode("windows-1251")>>output for s in rows]
    for item in queryset:
        doc = []
        doc.append(u'НачалоДок\n')
        doc.append(u'ДатаДок:%s\n' % item.created.strftime("%d.%m.%Y"))
        doc.append(u'Контрагент:%s\n' % item.patient.full_name())
        doc.append(u'НомерКарты:%s\n' % item.patient.hid_card)
        doc.append(u'Плательщик:%s\n' % (item.payer and item.payer.name or ''))
        contract = item.patient.contract_set.actual()
        doc.append(u'НомерДоговора:%s\n' % (contract and contract.id or ''))
        doc.append(u'ДатаДоговора:%s\n' % (contract and contract.created or ''))
        doc.append(u'Сумма:%s\n' % (item.total_price-item.total_discount))
        doc.append(u'КонецДок\n')
        
        [tmp_file.write(s.encode("windows-1251")) for s in doc]
    row = u"Конец выгрузки"
    tmp_file.write(u'Конец выгрузки\n'.encode("windows-1251"))
    tmp_file.seek(0)
    response =  HttpResponse(tmp_file, mimetype='text/plain')
    response['Content-Disposition'] = 'attachment; filename=visit_export.txt'
    return response
export_into_1c.short_description = u"Экспорт документов в 1С (txt-формат)"

#TODO: вернуть AutoComplete
from autocomplete.views import autocomplete, AutocompleteSettings
from autocomplete.admin import AutocompleteAdmin

class PatientAutocomplete(AutocompleteSettings):
    search_fields = ('^last_name', '^first_name')
    limit = 20
    
autocomplete.register(PlainVisit.patient, PatientAutocomplete)


class PlainVisitAdmin(AutocompleteAdmin, admin.ModelAdmin): 
    """
    """
    inlines = [OrderedServiceFullAdmin]
    actions = [export_into_1c]
    list_display = ('__unicode__','created','office','referral','operator','get_ad_source')
    list_filter = ('office',)
    date_hierarchy = 'created'
    search_fields = ('patient__last_name','barcode__id')
    readonly_fields = ('barcode',)
    form = VisitForm
    
    def save_model(self, request, obj, form, change):
        obj.save()
        if obj.on_date:
            obj.created=obj.on_date
            obj.save()

class ReferralVisitAdmin(admin.ModelAdmin):
    """
    """
    inlines = [OrderedServiceFullAdmin]
    list_display = ('__unicode__','referral','created')
    date_hierarchy = 'created'
    search_fields = ('patient__last_name','id')
    list_editable = ('referral',)
    list_filter = ('referral',)

class ReferralAdmin(admin.ModelAdmin):
    """
    """
    exclude = ('operator',)
    list_display = ('__unicode__','name','agent','visit_count')
    list_editable = ('name','agent',)
    
    def get_urls(self):
        urls = super(ReferralAdmin, self).get_urls()
        my_urls = patterns('',
            (r'^list/$', self.ref_list),
        )
        return my_urls + urls
    
    def ref_list(self, request):
        qs = Referral.objects.all()
        return object_list(request, qs, template_name='print/visit/referral_list.html')
    
    def visit_count(self, obj):
        return obj.visit_set.all().count()
    visit_count.short_description = u'Визиты'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.operator=request.user
        obj.save()
        
class ReferralListAdmin(admin.TabularInline):
    """
    """
    model = Referral
    fields = ('name',)
    extra = 0
        
class ReferralAgentAdmin(admin.ModelAdmin):
    """
    """
    exclude = ('operator',)
#    inlines = [ReferralListAdmin]
    list_display = ('__unicode__','name')
    list_editable = ('name',)
    
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.operator=request.user
        obj.save()
        
class OrderedServicePlainAdmin(admin.ModelAdmin):
    search_fields = ('order__patient__last_name','order__barcode__id')
    list_display = ('order','service')
    readonly_fields = ('order','service','sampling')
    exclude = ('assigment',)

admin.site.register(PlainVisit, PlainVisitAdmin)
admin.site.register(ReferralVisit, ReferralVisitAdmin)
#admin.site.register(Visit, VisitAdmin)
admin.site.register(Referral, ReferralAdmin)
admin.site.register(ReferralAgent, ReferralAgentAdmin)
admin.site.register(OrderedService, OrderedServicePlainAdmin)