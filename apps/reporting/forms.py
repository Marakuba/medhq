# -*- coding: utf-8 -*-
from django import forms
from patient.models import Patient
from staff.models import Staff
from visit.models import Referral,CLS
from service.models import ExecutionPlace
from visit.settings import PAYMENT_TYPES
from state.models import State, Department
from pricelist.models import PRICE_TYPES
from models import StateGroup

from fields import PatientModelChoiceField

patients = Patient.objects.all()
staffs = Staff.objects.all()
referrals = Referral.objects.all()
places_filial = State.objects.all()
places_office = StateGroup.objects.all()


class ReportForm(forms.Form):
    """
    """
    bill_type = forms.CharField(required=False, widget=forms.HiddenInput())
    start_date = forms.DateField(label=u'Дата с',
                                 required=False,
                                 widget=forms.DateInput(attrs={'class':'date-field'}))
    end_date = forms.DateField(label=u'Дата по',
                               required=False,
                               widget=forms.DateInput(attrs={'class':'date-field'}))

    order__cls = forms.ChoiceField(label=u'Форма обслуживания',
                                            choices=[('',u'-------------')]+list(CLS),
                                            required=False)
                                            
    order__patient = PatientModelChoiceField(label=u'Пациент',
                                            queryset=patients,
                                            required=False)

    staff__staff = forms.ModelChoiceField(label=u'Врач',
                                   queryset=staffs,
                                   required=False)
    
    staff__department = forms.ModelChoiceField(label=u'Отделение', 
                                               queryset=Department.objects.all(), 
                                               required=False)

    order__referral = forms.ModelChoiceField(label=u'Кто направил',
                                      queryset=referrals,
                                      required=False)
                                      
    from_place_filial = forms.ModelChoiceField(label=u'Место первичной регистрации (филиал)',
                                             queryset=places_filial,                                            
                                             required=False)
                                             
    from_lab = forms.ModelChoiceField(label=u'Лаборатория (плательщик)',
                                             queryset=places_filial,                                            
                                             required=False)
                                             
    execution_place_office = forms.ModelChoiceField(label=u'Место выполнения (ОФИС)',
                                             queryset=places_office,                                            
                                             required=False)

    execution_place_filial = forms.ModelChoiceField(label=u'Место выполнения (филиал)',
                                             queryset=places_filial,                                            
                                             required=False)
    
    order__payment_type = forms.ChoiceField(label=u'Форма оплаты',
                                            choices=[('',u'---------')]+PAYMENT_TYPES,
                                            required=False)
                                            
    price_type = forms.ChoiceField(label=u'Типы цены',
                                            choices=[('',u'---------')]+list(PRICE_TYPES),
                                             required=False,
                                             help_text = 'только для отчетов по ценам')

    details = forms.BooleanField(label=u'Показывать детально',
                                 initial=True,
                                 required=False,
                                 help_text=u'отображать или нет детальные сведения в отчетах с группами')