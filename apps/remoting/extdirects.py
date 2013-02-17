# -*- coding: utf-8 -*-

"""
"""

from django.utils import simplejson
from urllib2 import URLError

from extdirect.django.decorators import remoting
from direct.providers import remote_provider
from visit.models import OrderedService
from collections import defaultdict

from state.models import State
from constance import config

from .utils import post_data_to_remote


@remoting(remote_provider, len=1, action='remoting', name='postOrders')
def post_orders(request):
    """
    """
    data = simplejson.loads(request.raw_post_data)
    id_list = data['data'][0]
    object_list = OrderedService.objects.filter(id__in=id_list)
    _labs_cache = {}
    _object_list_cache = {}
    labs = defaultdict(list)
    for obj in object_list:
        _object_list_cache[obj.id] = obj
        p = obj.order.patient
        s = obj.execution_place
        source_lab = obj.order.office.uuid
        if source_lab == '':
            state = State.objects.get(id=config['MAIN_STATE_ID'])
            source_lab = state.uuid
        data = {
            'patient': {
                'id': p.id,
                'last_name': p.last_name,
                'first_name': p.first_name,
                'mid_name': p.mid_name,
                'birth_day': p.birth_day,
                'gender': p.gender,
                'mobile_phone': p.mobile_phone,
                'home_address_street': p.home_address_street
            },
            'order': {
                'id': obj.id,
                'code': obj.service.code
            },
            'visit': {
                'id': obj.order.id,
                'specimen': obj.order.specimen,
                'pregnancy_week': obj.order.pregnancy_week,
                'menses_day': obj.order.menses_day,
                'menopause': obj.order.menopause,
                'diagnosis': obj.order.diagnosis,
                'sampled': obj.order.sampled
            },
            'dest_lab': s.uuid,
            'source_lab': source_lab
        }
        labs[s.uuid].append(data)
        _labs_cache[s.uuid] = s

    for lab, data in labs.iteritems():
        try:
            result = post_data_to_remote(_labs_cache[lab], 'post_orders', data)
        except URLError, e:
            return dict(success=False, data={'state': _labs_cache[lab].name, 'reason': e.__unicode__()})
            break

        for r in result:
            status = r['success'] and u'>' or u'!'
            OrderedService.objects.filter(order__specimen=r['order'], service__code=r['service']).update(status=status)

    return dict(success=True, data=result)
