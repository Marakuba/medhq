# -*- coding: utf-8 -*-

from django.contrib import admin

from models import *
from django import forms
from examination.models import CardTemplate, ExaminationCard, FieldSet

class DICOMAdmin(admin.TabularInline):
    """
    """
    model = DICOM
    
    
class ExaminationCardAdmin(admin.ModelAdmin):
    """
    """
    exclude = ('ordered_service',)
    inlines = [DICOMAdmin]
    
class CardTemplateAdmin(admin.ModelAdmin):
    """
    """
    list_display = ('name','staff','group')
    list_filter = ('group','staff',)


admin.site.register(Equipment)
admin.site.register(FieldSet)
admin.site.register(ExaminationCard, ExaminationCardAdmin)
admin.site.register(CardTemplate, CardTemplateAdmin)
