# -*- coding: utf-8 -*-

"""
"""

from django.contrib import admin
from assistant.models import ExamAssistant


class ExamAssistantAdmin(admin.ModelAdmin):
    search_fields = ['assistant__staff__last_name',]
    readonly_fields = ['card','assistant']
    list_display = ['card','assistant']


admin.site.register(ExamAssistant, ExamAssistantAdmin)