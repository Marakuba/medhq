# -*- coding: utf-8 -*-
from django.forms.models import ModelChoiceField

class ServiceModelChoiceField(ModelChoiceField):
    
    def label_from_instance(self, obj):
        return obj.top_level_named()
    
