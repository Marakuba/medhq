# -*- coding: utf-8 -*-

from django.contrib import admin
from pricelist.models import PriceType, Discount

class PriceTypeAdmin(admin.ModelAdmin):
    """
    """
    list_display = ('name','slug', 'active', 'priority')
    
class DiscountAdmin(admin.ModelAdmin):
    """
    """
    list_display = ('name','value','min','max', lambda obj: obj.get_type_display())
    
admin.site.register(PriceType, PriceTypeAdmin)
admin.site.register(Discount, DiscountAdmin)