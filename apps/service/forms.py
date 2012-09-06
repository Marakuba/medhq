# -*- coding: utf-8 -*-
from django import forms
from django.forms.formsets import formset_factory
from staff.models import Staff, Position
from service.models import BaseService, ExtendedService
from state.models import State
from visit.settings import PAYMENT_TYPES

from django.contrib.admin import widgets
from pricelist.models import PriceType
from mptt.forms import TreeNodeChoiceField
from django.db.models.expressions import F

class HelperForm(forms.Form):
    """
    """
    is_active = forms.BooleanField(required=False)
    price = forms.DecimalField(required=False, max_digits=10, decimal_places=2)


HelperFormSet = formset_factory(HelperForm)


staff_qs = Position.objects.all()
service_qs = ExtendedService.objects.all()

class StaffForm(forms.Form):
    """
    """
    service = forms.ModelMultipleChoiceField(queryset=service_qs, widget=widgets.FilteredSelectMultiple(u'услуги',True) )
    staff = forms.ModelMultipleChoiceField(queryset=staff_qs, widget=widgets.FilteredSelectMultiple(u'персонал',True))
    
    
state_qs = State.objects.filter(type='b')
payer_qs = State.objects.all()
price_type_qs = PriceType.objects.all()
payment_types = PAYMENT_TYPES
payment_types.append((u'-',u'---'))
class PriceForm(forms.Form):
    """
    """
    
    date = forms.DateField(label=u'Дата', required=True)
    state = forms.ModelChoiceField(label=u'Организация',
                                            queryset=state_qs,
                                            required=False)
    payer = forms.ModelChoiceField(label=u'Плательщик',
                                            queryset=payer_qs,
                                            required=False)
    payment_type = forms.ChoiceField(label=u'Форма оплаты',
                                            choices=payment_types,
                                            required=False)
    price_type = forms.ModelChoiceField(label=u'Тип цены',
                                            queryset=price_type_qs,
                                            required=False)

lookups = {}
lookups[BaseService._meta.right_attr] = F(BaseService._meta.left_attr)+1

class TreeLoaderForm(forms.Form):
    """
    """
    f = forms.FileField(label=u'Файл', required=True)
    branches = forms.ModelMultipleChoiceField(label=u'Филиалы',
                                            queryset=state_qs,
                                            required=True,
                                            widget=forms.CheckboxSelectMultiple())
    state = forms.ModelChoiceField(label=u'Организация',
                                            queryset=payer_qs,
                                            required=True)
    root = TreeNodeChoiceField(label=u'Группа', 
                                 queryset=BaseService.objects.exclude(**lookups).order_by(BaseService._meta.tree_id_attr, BaseService._meta.left_attr, 'level'), 
                                 required=False)
    top = forms.CharField(label=u'Добавить в группу', required=False, max_length=300, 
                           widget=forms.TextInput(attrs={'size':100}))
