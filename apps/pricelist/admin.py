# -*- coding: utf-8 -*-

from django.contrib import admin
from pricelist.models import PriceType, PriceRule, Discount


class PriceRuleAdmin(admin.ModelAdmin):
    """
    """
    list_display = (lambda obj: obj.__unicode__(), 'slug', 'active', 'priority')


class PriceTypeAdmin(admin.ModelAdmin):
    """
    """
    fields = ('name',)


class DiscountAdmin(admin.ModelAdmin):
    """
    """
    list_display = ('name', 'value', 'min', 'max', lambda obj: obj.get_type_display())

admin.site.register(PriceRule, PriceRuleAdmin)
admin.site.register(PriceType, PriceTypeAdmin)
admin.site.register(Discount, DiscountAdmin)
