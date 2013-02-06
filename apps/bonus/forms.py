# -*- coding: utf-8 -*-


from service.models import BaseService
from service.fields import TreeModelMultipleChoiceField
from django.contrib.admin.widgets import FilteredSelectMultiple
from django import forms


qs = BaseService.objects.all().order_by(BaseService.tree.tree_id_attr, BaseService.tree.left_attr, 'level')


class ServiceGroupForm(forms.ModelForm):
    baseservice = TreeModelMultipleChoiceField(
        label=u'Услуги',
        queryset=qs,
        widget=FilteredSelectMultiple(u'Услуги', False)
    )
