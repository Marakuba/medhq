# -*- coding: utf-8 -*-

"""
"""
from django.http import HttpResponse
import urllib2
from extdirect.django.decorators import remoting
from direct.providers import remote_provider
from visit.models import OrderedService
from collections import defaultdict
from django.utils import simplejson
from django.core.serializers.json import DjangoJSONEncoder
from remoting.utils import post_orders_to_local, post_results_to_local
from remoting.models import Transaction, TransactionItem, SyncObject
import logging
from urllib2 import HTTPError, URLError
from state.models import State
from constance import config

logger = logging.getLogger('remoting')


ACTIONS = {
    'post_orders': post_orders_to_local,
    'post_results': post_results_to_local,
}


def router(request):
    """
    """
    data = simplejson.loads(request.raw_post_data)
    action = data['action']
    data_set = data['data']
    options = data['options']
    if action in ACTIONS:
        func = ACTIONS[action]
        result = func(data_set, options, request)

    return HttpResponse(simplejson.dumps(result), mimetype="application/json")


def post_data_to_remote(lab, action, data, options={}):
    """
    """
    domain = lab.remotestate.domain_url
    url = 'remoting/router/'
    path = domain + url
    json_data = simplejson.dumps({
        'action': action,
        'data': data,
        'options': options
    }, cls=DjangoJSONEncoder)

    try:
        if __debug__:
            msg = u'Данные к отправке: %s' % unicode(json_data)
            logger.debug(msg)

        req = urllib2.Request(path, json_data, {'Content-Type': 'application/json'})
        f = urllib2.urlopen(req)
        response = f.read()
        f.close()
        return simplejson.loads(response)
    except HTTPError, e:
        msg = u'Ошибка отправки данных: %s' % e.__unicode__()
        logger.exception(msg)

        msg = e.read()
        logger.exception(msg)

        raise Exception(e)


def post_results(lab_order):
    lab = lab_order.visit.office

    services = {}
    results = []
    for result in lab_order.result_set.all():
        a = result.analysis
        services[a.service.code] = True
        data = {
            'visit': {
                'specimen_id': lab_order.visit.specimen
            },
            'order': {
                'code': a.service.code
            },
            'result': {
                'name': a.name,
                'code': a.code,
                'value': result.value,
                'measurement': result.measurement,
                'ref_interval': result.ref_range_text
            },
        }
        results.append(data)

    options = {
        'services': services.keys()
    }

#    data_set = simplejson.dumps(results)

#    transaction = Transaction.objects.create(type='lab.out',
#                                             sender=request.active_profile.department.state,
#                                             reciever=_labs_cache[lab])
#    msg = simplejson.dumps(results)
#    logger.debug(msg)
    result = post_data_to_remote(lab, 'post_results', results, options)

    return result


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
#        transaction = Transaction.objects.create(type='state.out',
#                                                 sender=request.active_profile.department.state,
#                                                 reciever=_labs_cache[lab])
        try:
            result = post_data_to_remote(_labs_cache[lab], 'post_orders', data)
        except URLError, e:
            return dict(success=False, data={'state': _labs_cache[lab].name, 'reason': e.__unicode__()})
            break

        success = []
        error = []

        for r in result:
#            ordered_service = _object_list_cache[r['order']]
            status = r['success'] and u'>' or u'!'
            OrderedService.objects.filter(order__specimen=r['order'], service__code=r['service']).update(status=status)
#            if r['success']:
#                success.append(r['order'])
#            else:
#                error.append(r['order'])
#            status = r['success'] and 'complete' or 'error'
#            TransactionItem.objects.create(transaction=transaction,
#                                           status=status,
#                                           content_object=ordered_service,
#                                           message=r['message'])

#        print result
#        print success
#        print error
#            
#        OrderedService.objects.filter(order__specimen__in=success).update(status=u'>')
#        OrderedService.objects.filter(order__specimen__in=error).update(status=u'!')

    return dict(success=True, data=result)
