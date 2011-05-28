# -*- coding: utf-8 -*-
from django import forms
from patient.models import Patient
from staff.models import Staff
from visit.models import Referral
from service.models import ExecutionPlace, BaseServiceGroup, LabServiceGroup
from visit.settings import PAYMENT_TYPES
from state.models import State


patients = Patient.objects.all()
staffs = Staff.objects.all()
referrals = Referral.objects.all()
places = State.objects.all()
base_groups = BaseServiceGroup.objects.all()
lab_groups = LabServiceGroup.objects.all()


class ReportForm(forms.Form):
    """
    """
    start_date = forms.DateField(label=u'Дата с',
                                 required=False,
                                 widget=forms.DateInput(attrs={'class':'date-field'}))
    end_date = forms.DateField(label=u'Дата по',
                               required=False,
                               widget=forms.DateInput(attrs={'class':'date-field'}))
    order__patient = forms.ModelChoiceField(label=u'Пациент',
                                            queryset=patients,
                                            required=False)
    staff__staff = forms.ModelChoiceField(label=u'Врач',
                                   queryset=staffs,
                                   required=False)
    order__referral = forms.ModelChoiceField(label=u'Кто направил',
                                      queryset=referrals,
                                      required=False)
    service__base_group = forms.ModelChoiceField(label=u'Группа услуг',
                                             queryset=base_groups,
                                             required=False)
    service__lab_group = forms.ModelChoiceField(label=u'Лабораторная группа',
                                             queryset=lab_groups,
                                             required=False)
    execution_place = forms.ModelChoiceField(label=u'Место выполнения',
                                             queryset=places,
                                             required=False)
    order__payment_type = forms.ChoiceField(label=u'Форма оплаты',
                                            choices=[('',u'Любая')]+PAYMENT_TYPES,
                                            required=False)
    
    
class LabReportForm(forms.Form):
    """
    """
    start_date = forms.DateField(label=u'Дата с',
                                 required=False,
                                 widget=forms.DateInput(attrs={'class':'date-field'}))
    end_date = forms.DateField(label=u'Дата по',
                               required=False,
                               widget=forms.DateInput(attrs={'class':'date-field'}))
    order__referral = forms.ModelChoiceField(label=u'Кто направил',
                                      queryset=referrals,
                                      required=False)
    order__payment_type = forms.ChoiceField(label=u'Форма оплаты',
                                            choices=[('',u'Любая')]+PAYMENT_TYPES,
                                            required=False)
    
    

class CashReportForm(forms.Form):
    """
    """
    start_date = forms.DateField(label=u'Дата с',
                                 required=False,
                                 widget=forms.DateInput(attrs={'class':'date-field'}))
    end_date = forms.DateField(label=u'Дата по',
                               required=False,
                               widget=forms.DateInput(attrs={'class':'date-field'}))
    patient = forms.ModelChoiceField(label=u'Пациент',
                                            queryset=patients,
                                            required=False)
    referral = forms.ModelChoiceField(label=u'Кто направил',
                                      queryset=referrals,
                                      required=False)
    payment_type = forms.ChoiceField(label=u'Форма оплаты',
                                            choices=[('',u'Любая')]+PAYMENT_TYPES,
                                            required=False)