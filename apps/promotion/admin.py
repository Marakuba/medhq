# -*- coding: utf-8 -*-

"""
"""
from django.contrib import admin
from promotion.models import PromotionItem, Promotion

class PromotionItemAdmin(admin.TabularInline):
    """
    """
    model = PromotionItem


class PromotionAdmin(admin.ModelAdmin):
    """
    """    
    inlines = [PromotionItemAdmin]
    
admin.site.register(Promotion, PromotionAdmin)
