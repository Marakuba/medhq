# -*- coding: utf-8 -*-

"""
"""
from django.contrib import admin
from promotion.models import PromotionItem, Promotion

class PromotionItemAdmin(admin.TabularInline):
    """
    """
    model = PromotionItem


def update_total_price(modeladmin, request, queryset):
    for p in queryset:
        total_price = 0.0
        for item in p.promotionitem_set.all():
            price = item.base_service.price(state=item.execution_place)*item.count
            total_price+=price
        p.total_price = total_price
        if p.discount:
            p.total_price = p.total_price*float((100-p.discount.value)/100)
        p.save()
update_total_price.short_description = u'Обновить стоимость комплексной услуги/акции'

class PromotionAdmin(admin.ModelAdmin):
    """
    """    
    save_as = True
    inlines = [PromotionItemAdmin]
    actions = [update_total_price]
    readonly_fields = ('total_price',)
    list_display = ('name','start_date','end_date','total_price','discount')
    
admin.site.register(Promotion, PromotionAdmin)
