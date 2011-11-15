# -*- coding: utf-8 -*-

"""
"""
from django.contrib import admin
from remoting.models import RemoteState

class RemoteStateAdmin(admin.ModelAdmin):
    """
    """
    list_display = ('state','domain_url')
    
admin.site.register(RemoteState, RemoteStateAdmin)