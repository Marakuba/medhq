# -*- coding: utf-8 -*-
from django.contrib import admin
from models import *
from forms import *
from feincms.admin.tree_editor import TreeEditor
from django import forms as djforms


class StateGroup_StateInline(admin.TabularInline):
    model = StateGroup_State
    extra = 3


class ServiceGroupPrice_BaseServiceInline(admin.TabularInline):
    model = ServiceGroupPrice_BaseService
    extra = 3


class ServiceGroupPriceAdmin(admin.ModelAdmin):
    inlines = [ServiceGroupPrice_BaseServiceInline
    ]


from django.forms.models import ModelMultipleChoiceField
from service.models import BaseService
from django.contrib.admin.widgets import FilteredSelectMultiple

qs = BaseService.objects.all().order_by(BaseService.tree.tree_id_attr, BaseService.tree.left_attr, 'level')


class ServiceModelChoiceField(ModelMultipleChoiceField):

    def label_from_instance(self, obj):
        identer = u'---'
        if not obj.is_leaf_node():
            identer = u'+++'
        return u"%s %s" % (obj.level * identer, obj.name, )


class ServiceGroupForm(djforms.ModelForm):

    baseservice = ServiceModelChoiceField(label=u'Услуги', queryset=qs, widget=FilteredSelectMultiple(u'Услуги', False))


class ServiceGroupAdmin(admin.ModelAdmin):
    form = ServiceGroupForm
    filter_horizontal = ('baseservice',)


class StateGroupAdmin(admin.ModelAdmin):
    inlines = [StateGroup_StateInline]


class ReportAdmin(TreeEditor):
    list_display = ('name', 'slug', 'is_active')
    filter_horizontal = ('groups', 'users',)


class QueryAdmin(admin.ModelAdmin):
    form = QueryAdminForm

    class Media:
        js = ['libs/jquery.js', ]


admin.site.register(ServiceGroupPrice, ServiceGroupPriceAdmin)
admin.site.register(ServiceGroup, ServiceGroupAdmin)
admin.site.register(StateGroup, StateGroupAdmin)

admin.site.register(Query, QueryAdmin)
admin.site.register(Report, ReportAdmin)
