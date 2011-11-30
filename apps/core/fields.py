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




from django.db.models.fields import DateTimeField

class DTField(DateTimeField):
    """
    """
    def get_prep_lookup(self, lookup_type, value):
        "Perform preliminary non-db specific lookup checks and conversions"
        if hasattr(value, 'prepare'):
            return value.prepare()
        if hasattr(value, '_prepare'):
            return value._prepare()

        if lookup_type in (
                'regex', 'iregex', 'month', 'day', 'week_day', 'hour', 'search',
                'contains', 'icontains', 'iexact', 'startswith', 'istartswith',
                'endswith', 'iendswith', 'isnull'
            ):
            return value
        elif lookup_type in ('exact', 'gt', 'gte', 'lt', 'lte'):
            return self.get_prep_value(value)
        elif lookup_type in ('range', 'in'):
            return [self.get_prep_value(v) for v in value]
        elif lookup_type == 'year':
            try:
                return int(value)
            except ValueError:
                raise ValueError("The __year lookup type requires an integer argument")

        raise TypeError("Field has invalid lookup: %s" % lookup_type)