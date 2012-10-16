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


from django.db.models.loading import get_model

def copy_model_object(obj, \
                      copy_related=True, copy_self_refs=False, \
                      copy_rels=[],\
                      exclude=None, defaults=None, values=None, \
                      parent_obj=None, parent_field=None):
    """
    exclude:
    {
        '_':[],    # self fields list
        'somesubmodel_set':{'_': []}, # named as 'related_set'
        'anothersubmodel_set':{'_': []}
    }
    
    values: # ovverides existing values
        as exclude
    defaults:
        as values
    """
    # Инстанцируем новую модель
    model = get_model(obj._meta.app_label, obj._meta.module_name)
    new_model = model()

    # Получаем список полей, исключаем ненужные
    exclude = exclude or { '_': [] }

    # Автоматически исключаем поле с ключем
    pk_field = obj._meta.pk.name
    if pk_field not in exclude['_']:
        exclude['_'].append(pk_field)
    all_fields = [f.name for f in model._meta.fields]
    fields = list(set(all_fields) ^ set(exclude['_']))
    
    # Задаем аттрибуты полей и сохраняем
    defaults = defaults or { '_': {} }
    values = values or { '_': {} }
    
    # Принудительное заполнение родительского аттрибута для связанных моделей
    if parent_field and parent_obj:
        values['_'][parent_field] = parent_obj
    
    for field_name in fields:
        v = getattr(obj, field_name)
        
        if field_name in values['_']:
            v = values['_'][field_name]
        elif field_name in defaults['_'] and not v:
            v = defaults['_'][field_name]
            
        setattr(new_model, field_name, v)
        
    new_model.save()

    m2m_fields = model._meta.get_m2m_with_model()
    for field, fl in m2m_fields:
        field_name = field.name
        v = getattr(obj, field_name)
        v = v.all()
        if field_name in values['_']:
            v = values['_'][field_name]
        elif field_name in defaults['_'] and not v:
            v = defaults['_'][field_name]
            
        m2m_field = getattr(new_model, field_name)
        m2m_field.clear()
        m2m_field.add(*v)
    
    # Если стоит опция копирования дочерних объектов, запускаем обработку связей
    if copy_related:
        related_sets = model._meta.get_all_related_objects()
        for rel in related_sets:
            
            # пропускаем ссылки на собственную модель, если такая опция выключена в настройках
            if not copy_self_refs and rel.model==model:
                continue
            
            rel_name = rel.get_accessor_name()
            
            # если задан список связанных объектов и имя текущего сэта не находится в нём, то пропускаем
            if copy_rels and rel_name not in copy_rels:
                continue
            
            related_set = getattr(obj, rel_name)
            for related_obj in related_set.all():
                params = {
                    'obj':related_obj,
                    'copy_related':copy_related,
                    'copy_self_refs':copy_self_refs,
                    'exclude':rel_name in exclude and exclude[rel_name] or None,
                    'defaults':rel_name in defaults and defaults[rel_name] or None,
                    'values':rel_name in values and values[rel_name] or None,
                    'parent_obj':new_model,
                    'parent_field':rel.field.name
                }
                copy_model_object(**params)
                
    return new_model