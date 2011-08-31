# -*- coding: utf-8 -*-
from django import forms
from django.forms.formsets import formset_factory
from staff.models import Staff, Position
from service.models import BaseService, ExtendedService
from state.models import State

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
class PriceForm(forms.Form):
    """
    """
    state = forms.ModelChoiceField(label=u'Организация',
                                            queryset=state_qs,
                                            required=False)