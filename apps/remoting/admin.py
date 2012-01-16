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
    

class SyncObjectAdmin(admin.ModelAdmin):
    """
    """
    list_display = ('content_type','object_id','sync_id','state','created')
    

admin.site.register(SyncObject, SyncObjectAdmin)
admin.site.register(Transaction)
admin.site.register(TransactionItem)