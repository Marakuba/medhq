# -*- coding: utf-8 -*-

from django.contrib import admin
from taskmanager.models import DelayedTask


admin.site.register(DelayedTask)
