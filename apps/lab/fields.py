# -*- coding: utf-8 -*-
from django.forms.models import ModelChoiceField

class EqAnlModelChoiceField(ModelChoiceField):
    
    def label_from_instance(self, obj):
        return u"%s / %s" % (obj.service.short_name, obj.name)
    
