# -*- coding: utf-8 -*-

from django.contrib import admin
from taskmanager.models import DelayedTask


class DelayedTaskAdmin(admin.ModelAdmin):
    
    list_display = ('id','type','id_task','attempts','next_attempt','status')

admin.site.register(DelayedTask, DelayedTaskAdmin)
