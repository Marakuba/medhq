# -*- coding: utf-8 -*-

"""
"""

from django.contrib import admin
from billing.models import Payment


class PaymentAdmin(admin.ModelAdmin):
    
    date_hierarchy = 'doc_date'
    search_fields = ('client_account__client_item__client__last_name',)
    list_display = ('doc_date','get_client','amount','income','payment_type','office','created')
    list_filter = ('income','payment_type','office',)

admin.site.register(Payment,PaymentAdmin)