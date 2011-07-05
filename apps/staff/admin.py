# -*- coding: utf-8 -*-

from django.contrib import admin
from staff.models import Staff, Position
from core.admin import TabbedAdmin

class PositionInlineAdmin(admin.TabularInline):
    """
    """
    model = Position
    extra = 1

class StaffAdmin(TabbedAdmin):
    inlines = [PositionInlineAdmin]
    list_display = ('__unicode__','mobile_phone','user')
    fieldsets = (
        ('Личные данные',{
            'fields':('last_name','first_name','mid_name','birth_day','gender'),
        }),
        ('Контакты и адрес',{
            'fields':('work_phone','home_phone','mobile_phone','work_address_street','home_address_street'),
        }),
        ('Квалификация',{
            'fields':('high_school','speciality','high_school_end_date','medical_experience','spec_experience'),
        }),
        ('Идентификация',{
            'fields':('user',),
        }),
    )
    
    
    def save_model(self, request, obj, form, change):
        obj.operator=request.user
        obj.save()

admin.site.register(Staff, StaffAdmin)