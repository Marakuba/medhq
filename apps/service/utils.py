# -*- coding: utf-8 -*-

import csv
from state.models import State
from pricelist.models import Price
from django.db.models.aggregates import Max
from service.models import BaseService

import logging
import cStringIO
import codecs
import datetime
from medhq.apps.pricelist.models import get_actual_ptype
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

def get_service_tree(state=None,payer=None,payment_type=None,price_type=None, date=datetime.datetime.today()):
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
        args['extended_service__branches']=state
    
    if payment_type:
        args['payment_type'] = payment_type
        if payer and payment_type in [u'б',u'к']:
            args['payer'] = payer.id

    args['on_date__lte'] = date
    nodes = []
    if not price_type:
        price_type = get_actual_ptype()
    values = Price.objects.filter(extended_service__is_active=True, price_type='r',type=price_type,**args).\
        order_by('extended_service__id','on_date').\
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

class UnicodeWriter:
    """
    A CSV writer which will write rows to CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        # Redirect output to a queue
        self.queue = cStringIO.StringIO()
        self.writer = csv.writer(self.queue, dialect=dialect, **kwds)
        self.stream = f
        self.encoder = codecs.getincrementalencoder(encoding)()

    def writerow(self, row):
        self.writer.writerow([s.encode("utf-8") for s in row])
        # Fetch UTF-8 output from the queue ...
        data = self.queue.getvalue()
        data = data.decode("utf-8")
        # ... and reencode it into the target encoding
        data = self.encoder.encode(data)
        # write to the target stream
        self.stream.write(data)
        # empty queue
        self.queue.truncate(0)

    def writerows(self, rows):
        for row in rows:
            self.writerow(row)


def pricelist_dump(on_date=None, file_handler=None):
    if not on_date:
        on_date = datetime.date.today()
    table = UnicodeWriter(file_handler, delimiter=",")
    rows = [[u'ID услуги',u'extID',u'ID группы',u'Группа',u'Услуга',u'Краткое наименование',u'Организация',u'Активно',u'Цена (руб.коп)']]
    services = BaseService.objects.select_related().all().order_by(BaseService._meta.tree_id_attr, BaseService._meta.left_attr, 'level')
    for service in services:
        if not service.is_leaf_node():
            rows.append([str(service.id), 
                         u'', 
                         service.parent and str(service.parent.id) or u'.',
                         service.parent and service.parent.name or u'.',
                         service.name,
                         service.short_name or u'',
                         u'',
                         u'',
                         u''])
        else:
            for item in service.extendedservice_set.all():
                price = item.get_actual_price(date=on_date)
                rows.append([str(service.id), 
                             str(item.id), 
                             service.parent and str(service.parent.id) or u'.',
                             service.parent and service.parent.name or u'.',
                             service.name,
                             service.short_name or u'',
                             item.state.name,
                             item.is_active and "+" or "-",
                             price and str(price) or u''])
    
    table.writerows(rows)
