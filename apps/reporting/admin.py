# -*- coding: utf-8 -*-
from django.contrib import admin
from models import *
from forms import *

class StateGroup_StateInline(admin.TabularInline):
    model = StateGroup_State
    extra = 3

class ServiceGroupPrice_BaseServiceInline(admin.TabularInline):
    model = ServiceGroupPrice_BaseService
    extra = 3
    
class ServiceGroupPriceAdmin(admin.ModelAdmin):
    inlines = [ServiceGroupPrice_BaseServiceInline
    ]

class ServiceGroupAdmin(admin.ModelAdmin):
    filter_horizontal = ('baseservice',)
    pass

class StateGroupAdmin(admin.ModelAdmin):
    inlines = [StateGroup_StateInline
    ]

    pass

admin.site.register(ServiceGroupPrice,ServiceGroupPriceAdmin)
admin.site.register(ServiceGroup,ServiceGroupAdmin)
admin.site.register(StateGroup,StateGroupAdmin)
