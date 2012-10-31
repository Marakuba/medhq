# -*- coding: utf-8 -*-


from django.contrib import admin

from .models import Contract, Invoice


class ContractAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'branch', 'state')


class InoivceAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', )

admin.site.register(Contract, ContractAdmin)
admin.site.register(Invoice, InoivceAdmin)
