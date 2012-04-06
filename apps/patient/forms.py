# -*- coding: utf-8 -*-

"""
"""
from django import forms
import datetime

def end_of_year():
    
    today = datetime.date.today()
    
    return datetime.date(year=today.year, month=12, day=31)

class ContractForm(forms.Form):
    """
    """
    
    created = forms.DateField(label=u"Начало действия", 
                              required=True,
                              initial=datetime.date.today())
    expire = forms.DateField(label=u"Окончание действия", 
                             required=True,
                             initial=end_of_year())