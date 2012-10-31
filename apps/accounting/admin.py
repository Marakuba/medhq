# -*- coding: utf-8 -*-


from django.contrib import admin

from .models import Contract


class ContractAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'branch', 'state')

admin.site.register(Contract, ContractAdmin)
