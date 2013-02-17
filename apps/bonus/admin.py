# -*- coding: utf-8 -*-

from django.contrib import admin

from .models import BonusServiceGroup, BonusRule, BonusRuleItem, BonusRuleItemHistory, Calculation, CalculationItem
from .forms import ServiceGroupForm


class BonusServiceGroupAdmin(admin.ModelAdmin):
    filter_horizontal = ('services',)
    prepopulated_fields = {"slug": ("name",)}
    form = ServiceGroupForm


class BonusRuleItemInlineAdmin(admin.TabularInline):
    model = BonusRuleItem


class BonusRuleAdmin(admin.ModelAdmin):
    list_display = ('id', 'object_type', 'category', 'source', 'is_active')
    inlines = [BonusRuleItemInlineAdmin]


class BonusRuleItemHistoryInlineAdmin(admin.TabularInline):
    model = BonusRuleItemHistory


class BonusRuleItemAdmin(admin.ModelAdmin):
    inlines = [BonusRuleItemHistoryInlineAdmin]


class CalculationItemInlineAdmin(admin.TabularInline):
    model = CalculationItem
    readonly_fields = ('calculation', 'ordered_service', 'referral')


class CalculationAdmin(admin.ModelAdmin):

    inlines = [CalculationItemInlineAdmin]


admin.site.register(BonusServiceGroup, BonusServiceGroupAdmin)
admin.site.register(BonusRule, BonusRuleAdmin)
admin.site.register(BonusRuleItem, BonusRuleItemAdmin)
admin.site.register(Calculation, CalculationAdmin)
