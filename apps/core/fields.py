# -*- coding: utf-8 -*-

from django.db import models
from django import forms


class SeparatedValuesField(models.TextField):
    __metaclass__ = models.SubfieldBase
    
    def __init__(self, *args, **kwargs):
        self.token = kwargs.pop('token', ',')
        super(SeparatedValuesField, self).__init__(*args, **kwargs)

    def to_python(self, value):
        if not value: return
        if isinstance(value, list):
            return value
        return value.split(self.token)

    def get_db_prep_value(self, value):
        if not value: return
        assert(isinstance(value, list) or isinstance(value, tuple))
        return self.token.join([unicode(s) for s in value])

    def value_to_string(self, obj):
        value = self._get_val_from_obj(obj)

    def formfield(self, **kwargs):
        defaults = {'widget': forms.MultipleHiddenInput}
        defaults.update(kwargs)
        return super(SeparatedValuesField, self).formfield(**defaults)


from south.modelsinspector import add_introspection_rules
add_introspection_rules([], ["^core\.fields\.SeparatedValuesField"])