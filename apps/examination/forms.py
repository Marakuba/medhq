# -*- coding: utf-8 -*-

"""
"""
from django import forms
from patient.models import Patient
from djangocodemirror.fields import DjangoCodeMirrorField
from examination.models import Questionnaire

class EpicrisisForm(forms.Form):
    """
    """
    patient = forms.ModelChoiceField(queryset=Patient.objects.all())
    start_date = forms.DateField()
    end_date = forms.DateField()


class QuestionnaireAdminForm(forms.ModelForm):
    """
    """
    
    code = DjangoCodeMirrorField(label=u'Код', 
                                codemirror_attrs={
                                    'lineNumbers':True,
                                    'mode':'javascript',
                                    'json':True
                                })
    
    class Meta:
        model = Questionnaire

