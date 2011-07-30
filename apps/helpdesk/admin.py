# -*- coding: utf-8 -*-

"""
"""


from django.contrib import admin
from helpdesk.models import IssueType, Issue, IssueFeed

class IssueAdmin(admin.ModelAdmin):
    """
    """
    list_display = ('type','title','level','status','operator')
    list_filter = ('type','level','status')

admin.site.register(IssueType)
admin.site.register(Issue, IssueAdmin)
admin.site.register(IssueFeed)
