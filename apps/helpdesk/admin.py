# -*- coding: utf-8 -*-

"""
"""


from django.contrib import admin
from helpdesk.models import IssueType, Issue, IssueFeed


admin.site.register(IssueType)
admin.site.register(Issue)
admin.site.register(IssueFeed)
