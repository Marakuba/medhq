# -*- coding: utf-8 -*-

"""
"""
from django import forms
from selection.fields import ModelChoiceField

class AnalysisCopierForm(forms.Form):
    """
    """
    src = ModelChoiceField('service', label=u'Из услуги')
    dst = ModelChoiceField('service', label=u'В услугу')