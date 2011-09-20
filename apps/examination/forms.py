# -*- coding: utf-8 -*-

"""
"""
from django import forms
from patient.models import Patient

class EpicrisisForm(forms.Form):
    """
    """
    patient = forms.ModelChoiceField(queryset=Patient.objects.all())
    start_date = forms.DateField()
    end_date = forms.DateField()
    