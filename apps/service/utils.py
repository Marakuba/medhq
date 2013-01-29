# -*- coding: utf-8 -*-

import csv
from state.models import State
from pricelist.models import Price
from django.db.models.aggregates import Max
from service.models import BaseService, ExtendedService

import logging
import cStringIO
import codecs
import datetime
from pricelist.utils import get_actual_ptype
from django.utils import simplejson
from lab.models import LabService, Tube, InputList, Measurement, Analysis
from django.core.exceptions import MultipleObjectsReturned
from django.db import transaction
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
        new_analysis, created = Analysis.objects.get_or_create(service=obj, name=unicode(analysis[0], 'utf-8'))
        if analysis[1]:
            new_measurement, created = Measurement.objects.get_or_create(name=unicode(analysis[1], 'utf-8'))
            new_analysis.measurement = new_measurement
        if analysis[3]:
            new_input_mask, created = InputMask.objects.get_or_create(value=unicode(analysis[3], 'utf-8'))
            new_analysis.input_mask = new_input_mask
        new_analysis.save()
        logger.debug(u"SERVICE: Добавлен анализ: %s" % new_analysis)


def revert_tree_objects(obj):
    children = obj.get_children()
    for child in children:
        child.move_to(obj, position='first-child')
        revert_tree_objects(child)


def get_service_tree(state=None, payer=None, payment_type=None, price_type=None, date=None):
    """
    Генерирует дерево в json-формате.
    """

    def clear_tree(tree=[], empty=False):
        '''
        Рекурсивно очищает список, содержащий дерево, от пустых групп
        empty - признак того, есть ли в текущей группе элементы
        '''
        #Если список пуст, удалять больше нечего
        if len(tree) == 0:
            return []
        else:
            node = tree[-1]
            if (empty or node.is_root_node()) and not node.is_leaf_node():
                #Если это не группа или один из корней, то говорим, что потомков нет
                tree = clear_tree(tree[:-1], True) or []
            else:
                tree = clear_tree(tree[:-1], False) or []
            #Если нет потомков и текущий элемент - группа
            if not node.is_leaf_node() and empty:
                #удаляем текущий элемент
                node = None
            if node:
                tree.append(node)
            return tree

    date = date or datetime.datetime.today()
    ignored = None
    args = {}
    if state:
        ignored = State.objects.filter(type='b').exclude(id=state.id)
        args['extended_service__branches'] = state

    args['on_date__lte'] = date
    nodes = []
    if not price_type:
        # дата в функцию get_actual_ptype должна передаваться
        # в формате datetime.datetime, т.к. там определяется период действия
        # типа цены учитывая минуты
        time = datetime.datetime.now()
        d = datetime.datetime(year=date.year, month=date.month, day=date.day, hour=time.hour, minute=time.minute, second=time.second, microsecond=time.microsecond)
        price_type = get_actual_ptype(date=d, payer=payer, payment_type=payment_type)
    values = Price.objects.filter(extended_service__is_active=True,
                                    price_type='r', type=price_type, **args).\
        order_by('extended_service__id', 'on_date').\
        values('on_date', 'extended_service__id', 'value', 'extended_service__base_service__id').\
        annotate(Max('on_date'))
    result = {}
    for val in values:
        result[val['extended_service__base_service__id']] = val
    for base_service in BaseService.objects.all().order_by(BaseService._meta.tree_id_attr, BaseService._meta.left_attr, 'level'):
        if base_service.is_leaf_node():
            if base_service.id in result:
                nodes.append(base_service)
        else:
            nodes.append(base_service)

    mass = []
    nodes = clear_tree(nodes, True)
    for node in nodes:
        if node.id in result:
            k = [node, result[node.id]['value'] or None]
        else:
            k = [node, None]
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
    rows = [[u'ID услуги', u'extID', u'ID группы', u'Группа', u'Услуга',
            u'Краткое наименование', u'Организация', u'Активно', u'Цена (руб.коп)']]
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


import pandas as pd
from medhq.libs.utils.unicsv import UnicodeReader
from StringIO import StringIO
import decimal


class LoaderException(Exception):
    """
    """


class PriceListLoader():

    DLM = '/'

    def __init__(self, f, on_date=None, ptype=None):
        self.on_date = on_date or datetime.date.today()
        self.fn = f
        self.ptype = ptype
        # self.load_data(f)
        self.errors = []

    @transaction.commit_on_success
    def load_data(self):
        self.df = pd.read_csv(self.fn)
        self.df = self.df.dropna()
        self.ext_mode = 'price' in self.df
        self.get_groups()
        self.get_states()
        if self.errors:
            raise LoaderException()
        self.proccess_data()

    def ustrip(self, v):
        return unicode(v.strip(), 'utf-8')

    def proccess_data(self):
        for idx, row in self.df.iterrows():
            code = row['code'].strip()
            base_service = self.test_code(code)
            if not base_service:
                """
                обработка только добавления
                """
                parent = self.get_parent(row['group'])
                name = unicode(row['name'], 'utf-8')
                if len(name) > 300:
                    name = name[:300]
                short_name = unicode(row['short_name'], 'utf-8')
                if len(short_name) > 300:
                    short_name = short_name[:300]
                base_service, created = BaseService.objects.get_or_create(
                    parent=parent,
                    code=unicode(code, 'utf-8'),
                    name=name,
                    short_name=short_name,
                    type=unicode(row['type'], 'utf-8')
                )
            if self.ext_mode:
                extended_service, created = ExtendedService.objects.get_or_create(
                    base_service=base_service,
                    state=self.states[self.ustrip(row['state'])]
                )
                if row['branches']:
                    branches = []
                    for b in row['branches'].split(','):
                        branches.append(self.states[self.ustrip(b)])
                    extended_service.branches.add(*branches)
                if row['price']:
                    value = decimal.Decimal(row['price'].replace(',', '.'))
                    Price.objects.get_or_create(
                        extended_service=extended_service,
                        type=self.ptype,
                        value=value,
                        on_date=self.on_date
                    )

    def test_code(self, code):
        if not code:
            return False
        try:
            service = BaseService.objects.get(code__iexact=code)
            return service
        except:
            return False

    def get_states(self):
        self.states = {}

        states = sorted([unicode(idx, 'utf-8') for idx in self.df['state'].value_counts().index])
        for state in states:
            name = state.strip()
            if name not in self.states:
                try:
                    state_obj = State.objects.get(name=name)
                    self.states[name] = state_obj
                except:
                    self.errors.append(u'Организация "%s" не найдена' % name)

        branches = sorted([unicode(idx, 'utf-8') for idx in self.df['branches'].value_counts().index])
        for states in branches:
            for state in states.split(','):
                name = state.strip()
                if name not in self.states:
                    try:
                        state_obj = State.objects.get(name=name)
                        self.states[name] = state_obj
                    except:
                        self.errors.append(u'Организация "%s" не найдена' % name)

    def get_groups(self):
        groups = sorted([unicode(idx, 'utf-8') for idx in self.df['group'].value_counts().index])
        all_groups = []
        for group in groups:
            # print "group:", group
            all_groups.append(group)
            chunks = group.split(self.DLM)
            l = len(chunks)
            for i in range(l - 1, 0, -1):
                idx = l - i
                parent = self.DLM.join(chunks[:-idx])
                if parent not in all_groups:
                    all_groups.append(parent)

        self.groups = sorted(all_groups)
        self.group_objects = {}

    def get_parent(self, path):
        if path not in self.group_objects:
            """
            Группа не найдена, и её необходимо создать, но для этого надо проверить всех предков в указанном пути
            """

            name = path.split(self.DLM)[-1]
            parent_path = self.DLM.join(path.split(self.DLM)[:-1])
            if parent_path:
                """
                есть предок, будем получать его объект рекурсивным вызовом
                """
                parent = self.get_parent(parent_path)
            else:
                """
                нет предка, можно создавать группу в корне дерева
                """
                parent = None

            new_object, created = BaseService.objects.get_or_create(parent=parent, name=name, short_name=name, type='group')
            self.group_objects[path] = new_object

        return self.group_objects[path]


class ServiceTreeLoader():

    def __init__(self, f, branches, state, root=None, top=None, data_format='medhqjson'):
        self.root = root
        self.branches = branches
        self.state = state
        self.top = top
        self.format = data_format
        if self.top:
            self.top, created = BaseService.objects.get_or_create(parent=self.root,
                                                                  name=self.top,
                                                                  short_name=self.top)
            self.root = self.top
        self.load_data(f)

    def load_data(self, f):
        """
        """
        data_file = open(f)
        data = simplejson.loads("".join(data_file))
        if self.format == 'medhqjson':
            for node in data:
                self.build_service(node, self.root)
            if self.root is not None:
                root = BaseService.objects.get(id=self.root.id)
                revert_tree_objects(root)
        else:
            pass
        data_file.close()

    def make_indent(self, indent):
        return ((indent - 1) * "\t", indent * "\t")

    @transaction.commit_on_success
    def build_service(self, node, root=None, indent=1):
        service, created = BaseService.objects.get_or_create(parent=root,
                                                             name=node['name'],
                                                             short_name=node['short_name'],
                                                             code=node['code'],
                                                             execution_time=node['execution_time'],
                                                             gen_ref_interval=node['gen_ref_interval'],
                                                             is_group=node['is_group'])
        ti, di = self.make_indent(indent)

        if 'lab_service' in node:
            ls = node['lab_service']
            try:
                lab_service = service.labservice
                lab_service.code = ls['code']
                lab_service.is_manual = ls['is_manual']
                lab_service.save()
            except:
                LabService.objects.create(base_service=service,
                                          is_manual=ls['is_manual'],
                                          code=ls['code'])

        if 'extended_service' in node:
            es_list = node['extended_service']
            for es in es_list:
                tube = None
                if 'tube' in es and es['tube']:
                    tube, created = Tube.objects.get_or_create(name=es['tube']['name'],
                                                                bc_count=es['tube']['bc_count'])
                try:
                    extended_service, created = ExtendedService.objects.\
                                            get_or_create(base_service=service,
                                                          state=self.state,
                                                          tube=tube,
                                                          tube_count=es['tube_count'],
                                                          is_manual=es['is_manual'])
                except Exception, err:
                    pass

                if self.branches:
                    extended_service.branches.add(*self.branches)

        if 'analysis' in node:
            anl_list = node['analysis']
            for anl in anl_list:
                # print anl['name'], anl['code']
                il_cache = []
                if 'input_list' in anl:
                    for il in anl['input_list']:
                        try:
                            obj, created = InputList.objects.get_or_create(name=il)
                        except MultipleObjectsReturned:
                            obj = InputList.objects.filter(name=il)[0]
                        il_cache.append(obj)

                measurement = None
                if 'measurement' in anl and anl['measurement']:
                    measurement, created = Measurement.objects.get_or_create(name=anl['measurement'])

                analysis = Analysis.objects.create(service=service,
                                                          name=anl['name'],
                                                          code=anl['code'],
                                                          measurement=measurement,
                                                          ref_range_text=anl['ref_range_text'],
                                                          order=anl['order'])
#                if len(il_cache):
#                    analysis.input_list.add(*il_cache)

        if 'children' in node:
            for child in node['children']:
                self.build_service(child, service, indent + 1)
