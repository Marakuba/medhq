# -*- coding: utf-8 -*-
from django import forms
from django.forms.formsets import formset_factory
from staff.models import Staff, Position
from service.models import BaseService, ExtendedService
from state.models import State
from visit.settings import PAYMENT_TYPES

from django.contrib.admin import widgets

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