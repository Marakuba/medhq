# -*- coding: utf-8 -*-

from django.core.exceptions import ObjectDoesNotExist

def model_to_dict(obj, exclude=[]):
    '''
        serialize model object to dict with related objects

    '''
    tree = {}
    for field_name in obj._meta.get_all_field_names():
        try:
            field = getattr(obj, field_name)
        except (ObjectDoesNotExist, AttributeError):
            continue
        
        if field_name in exclude:
            continue
        
        field = obj._meta.get_field_by_name(field_name)[0]
        if field.__class__.__name__ in exclude:
            continue
        
        value = getattr(obj, field_name)
        
        if value:
            tree[field_name] = value
    return tree