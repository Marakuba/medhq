# -*- coding: utf-8 -*-

from django.contrib import admin
from pricelist.models import PriceType, Discount

class PriceTypeAdmin(admin.ModelAdmin):
    """
    """
    list_display = ('name','slug')
    
    
admin.site.register(PriceType, PriceTypeAdmin)
admin.site.register(Discount)