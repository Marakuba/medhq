# -*- coding: utf-8 -*-

import csv
from state.models import State
from pricelist.models import Price
from django.db.models.aggregates import Max
from service.models import BaseService

import logging
logger = logging.getLogger('general')

def unicode_csv_reader(unicode_csv_data, **kwargs):
    # csv.py doesn't do Unicode; encode temporarily as UTF-8:
    csv_reader = csv.reader(utf_8_encoder(unicode_csv_data), **kwargs)
    for row in csv_reader:
        # decode UTF-8 back to Unicode, cell by cell:
        yield [unicode(cell, 'utf-8').strip() for cell in row]

def utf_8_encoder(unicode_csv_data):
    for line in unicode_csv_data:
        yield line.encode('utf-8')


def make_analysis(obj, analysises):

    from lab.models import Analysis, InputMask, Measurement
    
    for analysis in analysises:
        new_analysis, created = Analysis.objects.get_or_create(service=obj, name=unicode(analysis[0],'utf-8'))
        if analysis[1]:
            new_measurement, created = Measurement.objects.get_or_create(name=unicode(analysis[1],'utf-8'))
            new_analysis.measurement = new_measurement 
        if analysis[3]:
            new_input_mask, created = InputMask.objects.get_or_create(value=unicode(analysis[3],'utf-8'))
            new_analysis.input_mask = new_input_mask
        new_analysis.save()
        logger.debug(u"SERVICE: Добавлен анализ: %s" % new_analysis)


def revert_tree_objects(obj):
    children = obj.get_children()
    for child in children:
        child.move_to(obj, position='first-child')
        revert_tree_objects(child)

def get_service_tree(state=None):
    """
    Генерирует дерево в json-формате.
    """
    def clear_tree(tree=[],empty=False):
        '''
        Рекурсивно очищает список, содержащий дерево, от пустых групп
        empty - признак того, есть ли в текущей группе элементы
        '''
        #Если список пуст, удалять больше нечего
        if len(tree)==0:
            return []
        else:
            node = tree[-1]
            if (empty or node.is_root_node()) and not node.is_leaf_node():
                #Если это не группа или один из корней, то говорим, что потомков нет
                tree = clear_tree(tree[:-1],True) or []
            else:
                tree = clear_tree(tree[:-1],False) or []
            #Если нет потомков и текущий элемент - группа
            if not node.is_leaf_node() and empty:
                #удаляем текущий элемент
                node = None
            if node:
                tree.append(node)
            return tree 
            
    ignored = None
    args = {}
    if state:
        ignored = State.objects.filter(type='b').exclude(id=state.id)
        args['extended_service__state']=state.id

    nodes = []
    values = Price.objects.filter(extended_service__is_active=True, price_type='r',**args).\
        order_by('extended_service__id').\
        values('extended_service__id','value','extended_service__base_service__id').\
        annotate(Max('on_date'))
    result = {}
    for val in values:
        result[val['extended_service__base_service__id']] = val
    for base_service in BaseService.objects.all().order_by(BaseService._meta.tree_id_attr, BaseService._meta.left_attr, 'level'): 
        if base_service.is_leaf_node():
            if result.has_key(base_service.id):
                nodes.append(base_service)
        else:
            nodes.append(base_service)
            
    mass = []        
    nodes = clear_tree(nodes,True)
    for node in nodes:
        if result.has_key(node.id):
            k = [node,result[node.id]['value'] or None]
        else:
            k = [node,None]
        mass.append(k)   
    #import pdb; pdb.set_trace()
    return mass
