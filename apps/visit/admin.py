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
from visit.models import Payment, Referral, IncomeMaterial, PlainVisit, PreVisit
from django.conf import settings


class OrderedServiceForm(forms.ModelForm):
    
    staff = forms.ModelChoiceField(queryset=Staff.objects.all(),  #@UndefinedVariable
                                   empty_label=u'--Лаборатория--', 
                                   required=False, label=u'Направлено')
    
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
    #form = OrderedServiceForm
    
state_qs = State.objects.filter(type=u'j')
base_service_qs = BaseService.objects.all()

class VisitForm(forms.ModelForm):
    """
    """
    payer = forms.ModelChoiceField(queryset=state_qs, empty_label=u'--Клиент--', 
                                   required=False, label=u'Плательщик', 
                                   help_text=u'Выбрать если оплату за клиента производит сторонняя организация', )
    services = forms.ModelMultipleChoiceField(queryset=base_service_qs, 
                                              required=False,
                                              widget=forms.MultipleHiddenInput)
    
    pay_and_bill = forms.BooleanField(required=False)
    
    
    class Meta:
        model = Visit
       
lab_qs = State.objects.filter(type__in=(u'm',u'b'))     
class IncomeForm(VisitForm):
    """
    """
    source_lab = forms.ModelChoiceField(queryset=lab_qs,
                                        required=True, label=u'Лаборатория')

def actions(obj):
    return u"<a href='%sprint/' title='Распечатать' target='_blank'><img src='%sresources/images/1294430047_print.png' border='0'></a>" % (obj.get_absolute_url(), settings.MEDIA_URL)
actions.short_description = u'Печать'
actions.allow_tags = True

def discount_value(obj):
    if obj.discount:
        return u"%s" % obj.discount.value
    return "---"
discount_value.short_description = u'Скидка'

class VisitAdmin(admin.ModelAdmin):
    """
    """
    exclude = ('operator',)
    form = VisitForm
    readonly_fields = ['total_price',]
    search_fields = ('patient__last_name','barcode__id')
    list_display = ('zid','full_name','created','is_billed','operator','total_price',discount_value,'total_discount','total_paid',actions)
    list_display_links = ('zid','full_name')
    #list_filter
    inlines = [OrderedServiceAdmin]
    date_hierarchy = 'created'
    fieldsets = (
        (None, {
            'fields':('patient','referral','payer')
        }),
#        (u'Услуги', {
#            'classes':('x-container',),
#            'fields':('services','staff')
#        }),
        (u'Дополнительно', {
            'fields':('pregnancy_week','menses_day','menopause','diagnosis','sampled')
        }),
        (u'Оплата', {
            'fields':('payment_type','total_paid','bill_date','is_billed','discount','comment')
        }),

    )


#    def save_formset(self, request, form, formset, change):
#        super(VisitAdmin, self).save_formset(request, form, formset, change)
#        instance = form.instance
#        items = instance.orderedservice_set.all()
#        total_price = 0
#        for item in items:
#            price = item.service.price()
#            total_price += price
#            item.price = price
#            item.total_price = price*item.count
#            item.save()
#        instance.total_price = total_price
#        instance.save()
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.operator=request.user
        if form.cleaned_data.has_key('pay_and_bill') and form.cleaned_data['pay_and_bill']:
            obj.is_billed=True
        obj.save()

    def to_print(self, request, object_id):
        """
        """
        visit = get_object_or_404(Visit, pk=object_id)
        visit.update_total_price()

        patient = visit.patient
        contract = patient.get_contract()
        extra_context = {
            'patient':patient,
            'contract':contract,
            'f':patient.is_f() and u"а" or u"",
            'ff':patient.is_f() and u"на" or u"ен",
            'visit':visit,
            'services':visit.orderedservice_set.all()
        }
        return direct_to_template(request, "print/visit/visit.html", extra_context=extra_context)
        
    def get_urls(self):
        urls = super(VisitAdmin, self).get_urls()
        my_urls = patterns('',
            url(r'^(?P<object_id>\d+)/print/$', self.to_print, name="visit_visit_print"),
        )
        return my_urls + urls

    def queryset(self, request):
        qs = super(VisitAdmin, self).queryset(request)
        return qs.filter(cls=u'п')
    
    class Media:
        
        css = {'all':(
                      'jquery/fancybox/jquery.fancybox-1.3.1.css',
                      'resources/css/xstyle.css'
                      )
        }
        
        js = ('resources/js/jquery-1.4.4.js',
              'jquery/fancybox/jquery.fancybox-1.3.1.pack.js',
              'jquery/jquery.nano.js',
              'resources/js/services.js',
              'resources/js/visit.js',
              )
        
class PlainVisitAdmin(admin.ModelAdmin):
    """
    """
    exclude = ('staff','services')
    inlines = [OrderedServiceFullAdmin]
    list_display = ('__unicode__','referral','created')
    date_hierarchy = 'created'
    search_fields = ('patient__last_name','id')
    list_editable = ('referral',)
    list_filter = ('referral',)

class PreVisitAdmin(admin.ModelAdmin):
    """
    """
    exclude = ('operator',)
    form = IncomeForm
    add_form_template = 'admin/visit/visit/change_form.html'
    change_form_template = 'admin/visit/visit/change_form.html'
    readonly_fields = ['total_price',]
    list_display = ('__unicode__','is_billed')
    fieldsets = (
        (None, {
            'fields':('patient','on_date','referral','payer')
        }),
        #(u'Услуги', {
        #    'classes':('x-container',),
        #    'fields':('services','staff')
        #}),
        (u'Дополнительно', {
            'fields':('pregnancy_week','menses_day','menopause','diagnosis','sampled')
        }),

    )
    inlines = [OrderedServiceAdmin]

    def queryset(self, request):
        qs = super(IncomeMaterialAdmin, self).queryset(request)
        return qs.filter(cls=u'з')

    def save_model(self, request, obj, form, change):
        if not change:
            obj.operator=request.user
            obj.is_billed = True
            obj.cls = u'з'
        obj.save()

    class Media:
        
        css = {'all':('jquery/fancybox/jquery.fancybox-1.3.1.css',
                      'resources/css/xstyle.css')}
        
        js = ('resources/js/jquery-1.4.4.js',
              'jquery/fancybox/jquery.fancybox-1.3.1.pack.js',
              'jquery/jquery.nano.js',
              'resources/js/services.js',
              'resources/js/visit.js',
              )



class ReferralAdmin(admin.ModelAdmin):
    """
    """
    exclude = ('operator',)
    list_display = ('__unicode__','name','visit_count')
    list_editable = ('name',)
    
    def visit_count(self, obj):
        return obj.visit_set.all().count()
    visit_count.short_description = u'Визиты'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.operator=request.user
        obj.save()


class IncomeMaterialAdmin(admin.ModelAdmin):
    """
    """
    exclude = ('operator',)
    form = IncomeForm
    add_form_template = 'admin/visit/visit/change_form.html'
    change_form_template = 'admin/visit/visit/change_form.html'
    readonly_fields = ['total_price',]
    list_display = ('__unicode__','is_billed')
    inlines = [OrderedServiceAdmin]
    date_hierarchy = 'created'
    search_fields = ('patient__last_name','id')
    fieldsets = (
        (None, {
            'fields':('patient','source_lab','on_date','referral')
        }),
#        (u'Услуги', {
#            'classes':('x-container',),
#            'fields':('services','staff')
#        }),
        (u'Дополнительно', {
            'fields':('pregnancy_week','menses_day','menopause','diagnosis','sampled')
        }),

    )

#    def save_formset(self, request, form, formset, change):
#        super(IncomeMaterialAdmin, self).save_formset(request, form, formset, change)
#        instance = form.instance
#        items = instance.orderedservice_set.all()
#        total_price = 0
#        for item in items:
#            price = item.service.price()
#            total_price += price
#            item.price = price
#            item.total_price = price*item.count
#            item.save()
#        instance.total_price = total_price
#        instance.save()
    
    def render_change_form(self, request, context, add=False, change=False, form_url='', obj=None):
        context.update({
            'priceless':True
        })
        return super(IncomeMaterialAdmin, self).render_change_form(request, context, add=add, change=change, form_url=form_url, obj=obj)

    def queryset(self, request):
        qs = super(IncomeMaterialAdmin, self).queryset(request)
        return qs.filter(cls=u'б')

    def save_model(self, request, obj, form, change):
        if not change:
            obj.operator=request.user
            obj.is_billed = True
            obj.cls = u'б'
            obj.payment_type = u'л'
        obj.save()

    class Media:
        
        css = {'all':('jquery/fancybox/jquery.fancybox-1.3.1.css',
                      'resources/css/xstyle.css')}
        
        js = ('resources/js/jquery-1.4.4.js',
              'jquery/fancybox/jquery.fancybox-1.3.1.pack.js',
              'jquery/jquery.nano.js',
              'resources/js/services.js',
              'resources/js/visit.js',
              )


class PaymentAdmin(admin.ModelAdmin):
    """
    """
    list_display = ('__unicode__','total_paid','get_visit_list','comment','operator')
    exclude = ('operator',)
    filter_horizontal = ('visits',)
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.operator=request.user
        obj.save()


admin.site.register(PreVisit, PreVisitAdmin)
admin.site.register(PlainVisit, PlainVisitAdmin)
admin.site.register(Visit, VisitAdmin)
admin.site.register(Referral, ReferralAdmin)
admin.site.register(Payment, PaymentAdmin)
admin.site.register(IncomeMaterial, IncomeMaterialAdmin)
