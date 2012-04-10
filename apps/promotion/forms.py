# -*- coding: utf-8 -*-
from django import forms
from patient.models import Patient
from staff.models import Staff
from visit.models import Referral,CLS
from visit.settings import PAYMENT_TYPES
from state.models import State, Department
from pricelist.models import PRICE_TYPES
from promotion.models import Promotion
from state.models import State

promotions = Promotion.objects.all()
states = State.objects.all()


class PromotionForm(forms.Form):
    """
    """
    promotion = forms.ModelChoiceField(label=u'акция',
                                   queryset=promotions,
                                   required=False)
    
    state = forms.ModelChoiceField(label=u'Место выполнения',
                                   queryset=states,
                                   required=False)
    
    file = forms.FileField(label=u'CSV-файл',required=False)