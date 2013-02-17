# -*- coding: utf-8 -*-

import simplejson

from direct.providers import remote_provider
from extdirect.django.decorators import remoting

from service.models import BaseService, ExtendedService
from examination.models import Template
from state.models import State
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
