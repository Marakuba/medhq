# -*- coding: utf-8 -*-
from django import forms
from django.forms.formsets import formset_factory

class HelperForm(forms.Form):
    """
    """
    is_active = forms.BooleanField(required=False)
    price = forms.DecimalField(required=False, max_digits=10, decimal_places=2)


HelperFormSet = formset_factory(HelperForm)