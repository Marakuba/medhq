# -*- coding: utf-8 -*-

from direct.providers import remote_provider
from extdirect.django.decorators import remoting
import simplejson
from service.models import BaseService, ExtendedService
from state.models import State
from examination.models import Template
from staff.models import Position


@remoting(remote_provider, len=1, action='service', name='getTplForService')
def get_tpl_for_service(request):
    r = simplejson.loads(request.raw_post_data)
    try:
        service_id = int(r['data'][0])
        tpl = Template.objects.get(base_service__id=service_id, staff=request.active_profile.staff,deleted=False)
    except Exception, err:
        return dict(success=False, msg=str(err))
    return dict(success=True, data=dict(id=tpl.id, title=tpl.name))

@remoting(remote_provider, len=1, action='service', name='getActualPrice')
def get_actual_price(request):
    data = simplejson.loads(request.raw_post_data)
    services = data['data'][0]['services']
    state = data['data'][0]['state']
    ptype = data['data'][0]['ptype']
    if data['data'][0].has_key('payer'):
        try:
            payer = State.objects.get(id=data['data'][0]['payer'])
        except:
            payer = None
    else:
        payer = None
    new_data = {}
    for serv in services:
        try:
            ext_serv = ExtendedService.objects.get(base_service=serv[0],state=serv[1])
        except:
            ext_serv = None
        if ext_serv:
            price = ext_serv.get_actual_price(payment_type=ptype,payer = payer)
            id = '%s_%s' % (serv[0],ext_serv.state and ext_serv.state.id or '')
            new_data[id] = price
    return dict(success=True, data=new_data)


@remoting(remote_provider, len=1, action='service', name='updateStaffInfo')
def update_patient_info(request):
    data = simplejson.loads(request.raw_post_data)
    params = data['data'][0]
    records = params['records']
    services = map(lambda x: x[0], records)
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
