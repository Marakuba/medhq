# -*- coding: utf-8 -*-

"""
"""
from django.contrib import admin
from remoting.models import RemoteState, SyncObject, Transaction,\
    TransactionItem

class RemoteStateInlineAdmin(admin.TabularInline):
    """
    """
    model = RemoteState
    extra = 1 
    

admin.site.register(SyncObject)
admin.site.register(Transaction)
admin.site.register(TransactionItem)