# -*- coding: utf-8 -*-

from django.contrib import admin
from taskmanager.models import DelayedTask


class DelayedTaskAdmin(admin.ModelAdmin):
    
    def get_info(self, obj):
        o = obj.assigned_to
        if hasattr(o, 'get_info'):
            return o.get_info()
        else:
            return '?'
    
    list_display = ('id','get_info','type','id_task','attempts','next_attempt','status')

admin.site.register(DelayedTask, DelayedTaskAdmin)
