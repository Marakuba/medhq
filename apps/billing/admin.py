# -*- coding: utf-8 -*-

"""
"""

from django.contrib import admin
from billing.models import Payment


class PaymentAdmin(admin.ModelAdmin):
    
    date_hierarchy = 'doc_date'
    search_fields = ('id','client_account__client_item__client__last_name',)
    list_display = ('id','doc_date','get_client','amount','direction','payment_type','office','created')
    list_filter = ('direction','payment_type','office',)
    exclude = ('income','content_type','object_id')
    readonly_fields = ('client_account',)

admin.site.register(Payment,PaymentAdmin)