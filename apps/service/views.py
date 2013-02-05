# -*- coding: utf-8 -*-

from direct.providers import remote_provider
from extdirect.django.decorators import remoting
import simplejson
from service.models import BaseService, ExtendedService
from state.models import State
from examination.models import Template
from staff.models import Position


POINTS = {
    'above': 'left',
    'below': 'right'
}


@remoting(remote_provider, len=3, action='service', name='moveNode')
def move_node(request):

    r = simplejson.loads(request.raw_post_data)
    # print r['data']
    try:
        drop_node = BaseService.objects.get(id=int(r['data'][0]))
    except Exception:
        return dict(success=False, msg=u"Drop node not found")

    try:
        target_node = BaseService.objects.get(id=int(r['data'][1]))
    except Exception:
        return dict(success=False, msg=u"Target node not found")

    point = r['data'][2]
    if point not in POINTS:
        return dict(success=False, msg=u"Неправильная позиция")

    drop_node.move_to(target_node, position=POINTS[point])

    return dict(success=True, msg=u"OK")


@remoting(remote_provider, len=1, action='service', name='getTplForService')
def get_tpl_for_service(request):
    r = simplejson.loads(request.raw_post_data)
    try:
        service_id = int(r['data'][0])
        tpl = Template.objects.get(base_service__id=service_id, staff=request.active_profile.staff, deleted=False)
    except Exception, err:
        return dict(success=False, msg=str(err))
    return dict(success=True, data=dict(id=tpl.id, title=tpl.name))


@remoting(remote_provider, len=1, action='service', name='getActualPrice')
def get_actual_price(request):
    data = simplejson.loads(request.raw_post_data)
    services = data['data'][0]['services']
    ptype = data['data'][0]['ptype']
    if 'payer' in data['data'][0]:
        try:
            payer = State.objects.get(id=data['data'][0]['payer'])
        except:
            payer = None
    else:
        payer = None
    new_data = {}
    for serv in services:
        try:
            ext_serv = ExtendedService.objects.get(base_service=serv[0], state=serv[1])
        except:
            ext_serv = None
        if ext_serv:
            price = ext_serv.get_actual_price(payment_type=ptype, payer=payer)
            id = '%s_%s' % (serv[0], ext_serv.state and ext_serv.state.id or '')
            new_data[id] = price
    return dict(success=True, data=new_data)


@remoting(remote_provider, len=1, action='service', name='updateStaffInfo')
def update_staff_info(request):
    data = simplejson.loads(request.raw_post_data)
    params = data['data'][0]
    services = params['records']
    bs_list = BaseService.objects.filter(id__in=services)
    service_list = []
    for s in bs_list:
        service_list += s.extendedservice_set.all()
    staff = params['staff']
    try:
        p = Position.objects.get(id=staff)
        for service in service_list:
            service.staff.add(p)
            service.save()
        result = {
            'success': True,
            'data': {
                'text': 'Операция проведена успешно'
            }
        }
    except:
        result = {
            'success': False,
            'data': {
                'text': 'Врач не найден'
            }
        }

    return result


@remoting(remote_provider, len=1, action='service', name='setActive')
def set_services_active(request):
    data = simplejson.loads(request.raw_post_data)
    params = data['data'][0]
    services = params['records']
    status = params['status']
    bs_list = BaseService.objects.filter(id__in=services)
    service_list = []
    for s in bs_list:
        service_list += s.extendedservice_set.all()
    try:
        for service in service_list:
            service.is_active = status
            service.save()
        result = {
            'success': True,
            'data': {
                'text': 'Операция проведена успешно'
            }
        }
    except:
        result = {
            'success': False,
            'data': {
                'text': 'Ошибка на сервере'
            }
        }

    return result


import datetime
from django.conf import settings
# from django.core.cache import get_cache
from pricelist.models import Price
from pricelist.utils import get_actual_ptype
from django.db.models import Max
from promotion.models import Promotion, PromotionItem
from django.core.serializers.json import DjangoJSONEncoder
from collections import defaultdict


def get_service_tree(request):

    import sys

    sys.setrecursionlimit(4000)

    """
    Генерирует дерево в json-формате.

    Ключ кэша:

    service_list_-stateId или *-_-способ оплаты-

    service_list_*_н - любая организация, способ оплаты - наличный платеж
    service_list_2_д - организация #2, способ оплаты - ДМС
    и т.д.
    """

    def promo_dict(obj):

        def node_dict(obj):
            try:
                bs = promotions_bs[obj.base_service_id]
                for k, v in result[obj.base_service_id].iteritems():
                    if v['extended_service__state__id'] == obj.execution_place_id:
                        es = v['extended_service__id']
                        price = v['value']
                        break
#                es = bs.extendedservice_set.get(state=obj.execution_place)
                if not es:
                    return None
                node = {
                    "id": ext and es or '%s-%s' % (obj.base_service_id, obj.execution_place_id),
                    "text": "%s" % (bs['base_service__short_name'] or bs['base_service__name'], ),
                    "price": price,
                    "c": obj.count or 1
                }
                node['staff'] = obj.base_service_id in staff_all and sorted(staff_all[obj.base_service_id], key=lambda staff: staff[1])
                return node
            except:
                # logger.error(u"NODE DICT: %s" % err.__unicode__())
                return None

        return {
            'id': obj['id'],  # u'%s_%s' % (obj.base_service.id, obj.execution_place.id),
            'text': obj['name'],  # obj.base_service.short_name or obj.base_service.name,
            'leaf': True,
            'nodes': [node_dict(node) for node in obj['items'] if node],
            'discount': obj['discount_id'],
            'price': obj['total_price'],
            'isComplex': True
        }

    def clear_tree(tree=[], child_list=[]):
        '''
        Рекурсивно очищает список, содержащий дерево, от пустых групп;
        Одеревенезирует этот список.
        empty - признак того, есть ли в текущей группе элементы
        child_list - двумерный список всех детей для еще не найденных родителей.
        '''
        #Если список пуст, удалять больше нечего
        if len(tree) == 0:
            return (child_list and child_list[0]) or []
        else:
            node = tree[-1]
            parent = node.parent_id

            bro = []
            childs = []

            for item in child_list:
                #Если список детей <> [] и либо item[0] и текущий node - корни дерева, либо относятся к одному родителю
                if item and ((not item[0]['parent'] and not parent) or (parent and item[0]['parent'] == parent)):
                    # то это братья
                    bro = item
                if item and not node.is_leaf_node() and item[0]['parent'] == node.id:
                    childs = item
            tree_nodes = []
            if not node.is_leaf_node() and not childs:
                #удаляем текущий элемент
                node = None
            else:

                if node.is_leaf_node() and not node.type == 'group':
                    tree_node = leaf_func(node, parent)
                else:
                    tree_node = group_func(node, parent, childs)

                tree_nodes.extend(tree_node)

                #Если есть братья, добавляем текущий элемент к списку братьев
                #Иначе создаём новый список братьев, в котором текущий элемент будет первым братом
                if bro:
                    for tr in tree_nodes:
                        bro.insert(0, tr)
                else:
                    child_list.insert(0, tree_nodes)

                #Если есть список дочерних элементов и текущий элемент - их родитель,
                #то удаляем этот список из общего списка детей, за ненадобностью
                if childs and tree_nodes[0]['leaf'] == False:
                    child_list.remove(childs)

            tree = clear_tree(tree[:-1], child_list) or []

#            if node:
#                tree.append(node)
            return tree

    def base_service_leaf(node, parent):
        tree_node = {
            "id": node.id,
            "leaf": True,
            'text': "%s" % (node.short_name or node.name,),
            'type': node.type,
            'code': node.code,
            "parent": parent
        }
        return [tree_node]

    def base_service_group(node, parent, childs):
        tree_node = {
            "id": node.id,
            "leaf": False,
            'text': "%s" % (node.short_name or node.name,),
            # 'singleClickExpand': True,
            'type': node.type,
            "parent": parent,
            'children': childs
        }
        return [tree_node]

    def ext_service_leaf(node, parent):
        tree_nodes = []
        for service in result[node.id]:
            node_id = ext and service or '%s-%s' % (node.id, result[node.id][service]['extended_service__state__id'])
            tree_node = {
                "id": node_id,
                "text": "%s" % (node.short_name or node.name),
                "cls": "multi-line-text-node",
                "price": str(result[node.id][service]['value']),
                "exec_time": "%s" % (node.execution_time and u"%s мин" % node.execution_time or u''),
                "iconCls": "ex-place-%s" % result[node.id][service]['extended_service__state__id'],
                "parent": parent,
                "leaf": True
            }
            if not ext:
                tree_node['staff'] = node.id in staff_all and sorted(staff_all[node.id], key=lambda staff: staff[1])
            tree_nodes.append(tree_node)
        return tree_nodes

    def ext_service_group(node, parent, childs):
        tree_node = {
            "id": ext and 'group-%s' % node.id or node.id,
            "leaf": False,
            'text': "%s" % (node.short_name or node.name,),
            'singleClickExpand': True,
            "parent": parent,
            'children': childs
        }
        return [tree_node]

    leaf_func = base_service_leaf
    group_func = base_service_group

    payment_type = request.GET.get('payment_type')
    staff = request.GET.get('staff') or None
    payer = request.GET.get('payer') or None

    if payment_type or staff or payer:
        # Если передан staff, то нам цены не нужны. Это значит, что мы работаем
        # с конструктором шаблонов

        # nocache = request.GET.get('nocache')
        # recache = request.GET.get('recache')
        # payment_type = payment_type or u'н'
        leaf_func = ext_service_leaf
        group_func = ext_service_group
        all = request.GET.get('all')
        ext = request.GET.get('ext')

        TODAY = datetime.date.today()
        on_date = request.GET.get('on_date', TODAY)
        if on_date and not isinstance(on_date, datetime.date):
            try:
                on_date = datetime.datetime.strptime(on_date, '%Y-%m-%d')
                # nocache = True
            except:
                on_date = TODAY

        state = None
        ap = request.active_profile
        if (settings.SERVICETREE_ONLY_OWN or ap.department.state.type == 'p') and ap and not all:
            state = ap.department.state

        # try:
        #     cache = get_cache('service')
        # except:
        #     raise "Service cache must be defined!"

        if payer:
            try:
                payer = State.objects.get(id=payer)
            except:
                payer = None

        if staff:
            try:
                staff = Position.objects.get(id=staff)
            except:
                staff = None

        # дата в функцию get_actual_ptype должна передаваться
        # в формате datetime.datetime, т.к. там определяется период действия
        # типа цены учитывая минуты
        time = datetime.datetime.now()
        price_args = dict(extended_service__is_active=True,
                          on_date__lte=on_date)
        if staff:
            price_args['extended_service__staff'] = staff
        else:
            d = datetime.datetime(year=on_date.year,
                                  month=on_date.month,
                                  day=on_date.day,
                                  hour=time.hour,
                                  minute=time.minute,
                                  second=time.second,
                                  microsecond=time.microsecond)
            p_type_id = get_actual_ptype(date=d,
                                         payer=payer and payer.id or None,
                                         payment_type=payment_type)

            # _cache_key = u'%sservice_list_%s_%s_%s_%s' % (ext and 'ext_' or '', state and state.id or u'*', payment_type, payer and payer.id or '*', p_type_id or '*')

            # запрос с параметром recache удаляет ВСЕ записи в нём
            # if recache:
            #     cache.clear()

            # если передаем параметр nocache, кэширование не происходит. иначе пробуем достать кэш по ключу
            # if nocache:
            #     _cached_tree = None
            # else:
            #     _cached_tree = cache.get(_cache_key)

            # если отсутствует кэш, то начинаем построение дерева услуг
            # _cached_tree = None
            # if not _cached_tree:

            if state:
                price_args['extended_service__branches'] = state
            # if payer:
            #     price_args['payer'] = payer.id
            # else:
            #     price_args['payer__isnull'] = True
            if not all:
                price_args['type'] = p_type_id

        values = Price.objects.filter(**price_args).\
            order_by('extended_service__id', 'on_date').\
            values('on_date', 'extended_service__id', 'extended_service__state__id', \
                'extended_service__staff__id', 'value', 'extended_service__base_service__id').\
            annotate(Max('on_date'))
        result = {}
        for val in values:
            if val['extended_service__base_service__id'] not in result:
                result[val['extended_service__base_service__id']] = {}
            result[val['extended_service__base_service__id']][val['extended_service__id']] = val

        staff_all = ExtendedService.get_all_staff()

    #### формируем и очищаем услуги

    # BaseService.cache_parents()

    nodes = []
    for base_service in BaseService.objects.select_related().all().order_by(BaseService.tree.tree_id_attr, BaseService.tree.left_attr, 'level'):
        if payment_type and base_service.is_leaf_node() and base_service.id not in result:
            continue
        nodes.append(base_service)

    tree = []

    # если передан параметр payment_type и не передан staff, добавляем промо-акции в дерево услуг
    if not staff and payment_type:
        promotions = Promotion.objects.actual(ap.department.state)
        promotions_items = PromotionItem.objects.filter(promotion__in=promotions)
        promotions_dict = defaultdict(list)
        promotions_bs = {}
        for item in promotions_items.values('base_service__id',
                                            'base_service__name',
                                            'base_service__short_name'):
            promotions_bs[item['base_service__id']] = item

        for p in promotions_items:
            promotions_dict[p.promotion_id].append(p)

        if promotions.count():
            tree_node = {
                'id': 'promotions',
                'text': u'Акции / Комплексные обследования',
                'children': [promo_dict({'items': promotions_dict[promo.id],
                                        'id': promo.id,
                                        'name': promo.name,
                                        'discount_id': promo.discount_id,
                                        'total_price': promo.total_price}) \
                             for promo in promotions],
                'leaf': False,
                'singleClickExpand': True
            }
            tree.append(tree_node)
    # _cached_tree = simplejson.dumps(tree, cls=DjangoJSONEncoder)

    # кэш не обновляется, если есть параметр nocache
    # if not nocache:
    #     cache.set(_cache_key, _cached_tree, 24 * 60 * 60 * 30)

    s = clear_tree(nodes, [])
    tree.extend(s)

    return simplejson.dumps(tree, cls=DjangoJSONEncoder)


from django.http import HttpResponse
from django.views.decorators.gzip import gzip_page


@gzip_page
def service_tree(request):
    resp = get_service_tree(request)
    cb = request.GET.get('cb')
    if cb:
        resp = u'%s(%s)' % (cb, resp)
    return HttpResponse(resp, mimetype="application/json")
