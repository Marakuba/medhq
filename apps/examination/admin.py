# -*- coding: utf-8 -*-

from django.contrib import admin

from models import *
from django import forms
from examination.models import CardTemplate, ExaminationCard

class DICOMAdmin(admin.TabularInline):
    """
    """
    model = DICOM
    
    
class ExaminationCardAdmin(admin.ModelAdmin):
    """
    """
    exclude = ('ordered_service',)
    inlines = [DICOMAdmin]


admin.site.register(Equipment)
admin.site.register(ExaminationCard, ExaminationCardAdmin)
admin.site.register(CardTemplate)
