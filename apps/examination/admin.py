# -*- coding: utf-8 -*-

from django.contrib import admin

from models import *
from django import forms
from examination.models import CardTemplate, ExaminationCard, FieldSet, SubSection, Glossary, Questionnaire
from examination.forms import QuestionnaireAdminForm

class DICOMAdmin(admin.TabularInline):
    """
    """
    model = DICOM
    
    
class ExaminationCardAdmin(admin.ModelAdmin):
    """
    """
    exclude = ('ordered_service',)
    list_display = ('created','service','patient','assistant')
#    list_editable = ('assistant',)
    search_fields = ('ordered_service__order__patient',)
    date_hierarchy = 'created'
    inlines = [DICOMAdmin]
    
    def service(self, obj):
        return obj.ordered_service.service
    service.short_description = u'Услуга'
    
    def patient(self, obj):
        return obj.ordered_service.order.patient.short_name()
    patient.short_description = u'Пациент'
    
    def icd(self, obj):
        return obj.mbk_diag or u'<em>не указано</em>'
    icd.short_description = u'Диагноз по МКБ'
    icd.allow_tags = True
    
class CardTemplateAdmin(admin.ModelAdmin):
    """
    """
    list_display = ('name','staff','group')
    list_filter = ('group','staff',)

class GlossaryAdmin(admin.ModelAdmin):
    """
    """
    list_display = ('text','staff','base_service','parent')
    list_filter = ('base_service','staff',)
    
class SubSectionInlineAdmin(admin.TabularInline):
    model = SubSection
    
class FieldSetAdmin(admin.ModelAdmin):
    inlines = [SubSectionInlineAdmin]
    list_display = ('title','name','order','active')
    ordering = ('order',)
    
class QuestionnaireAdmin(admin.ModelAdmin):
    filter_horizontal = ('staff','base_service',)
    form = QuestionnaireAdminForm
    
    class Media:
        js = ['libs/jquery.js',]


class TemplateAdmin(admin.ModelAdmin):
    save_as = True
    list_display = ('name','print_name','base_service','staff')
    
class CardAdmin(admin.ModelAdmin):
    readonly_fields = ['ordered_service','mkb_diag']
    
admin.site.register(Equipment)
admin.site.register(Card, CardAdmin)
admin.site.register(Template, TemplateAdmin)
admin.site.register(FieldSet, FieldSetAdmin)
#admin.site.register(ExaminationCard, ExaminationCardAdmin)
#admin.site.register(CardTemplate, CardTemplateAdmin)
admin.site.register(Glossary, GlossaryAdmin)
admin.site.register(Questionnaire, QuestionnaireAdmin)
