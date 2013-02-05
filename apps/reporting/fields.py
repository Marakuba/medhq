# -*- coding: utf-8 -*-
from django.forms.models import ModelChoiceField

class PatientModelChoiceField(ModelChoiceField):

    def label_from_instance(self, obj):
        return u"%s /%s/" % (obj.full_name(), obj.birth_day.strftime("%d.%m.%Y"))

