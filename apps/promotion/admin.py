# -*- coding: utf-8 -*-

"""
"""
from django.contrib import admin
from promotion.models import PromotionItem, Promotion
from django import forms
from service.fields import ServiceModelChoiceField
from service.models import BaseService, ExtendedService
from django.db.models.expressions import F
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template.context import RequestContext

lookups = {}
lookups[BaseService._meta.right_attr] = F(BaseService._meta.left_attr)+1
qs = BaseService.objects.filter(**lookups)#.order_by(BaseService._meta.tree_id_attr, BaseService._meta.left_attr, 'level')

class PromotionItemForm(forms.ModelForm):
    """
    """
    
    base_service = ServiceModelChoiceField(label="Услуга",
                                           queryset=qs, 
                                           required=True)
    
    class Meta:
        model = PromotionItem
    
    

class PromotionItemAdmin(admin.TabularInline):
    """
    """
    model = PromotionItem
    form = PromotionItemForm


def update_total_price(modeladmin, request, queryset):
    promotions = []
    for p in queryset:
        items = []
        total_price = 0.0
        cfg = {'instance':p}
        for item in p.promotionitem_set.all():
            service_price = item.base_service.price(state=item.execution_place)
            price = service_price*item.count
            ext_service = ExtendedService.objects.get(base_service=item.base_service.id,state=item.execution_place)
            is_active = ext_service.is_active
            
            items.append({ 'service':item.base_service, 'price':service_price, 'count':item.count, 'is_active': is_active})
            if is_active:
                total_price+=price
        cfg['items']=items
        cfg['raw_price'] = total_price
        if p.discount:
            cfg['discount'] = p.discount
            total_price = total_price*float((100-p.discount.value)/100)
        cfg['total_price'] = total_price
        p.total_price = str(total_price)
        p.save()
        
        promotions.append(cfg)
    
    if 'apply' in request.POST:
        return HttpResponseRedirect(request.get_full_path())
    
    ctx = {
        'promotions':promotions
    }
    
    return render_to_response('admin/promotion/promotion/pricelist.html',ctx,context_instance=RequestContext(request))
    
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
