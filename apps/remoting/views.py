# -*- coding: utf-8 -*-

"""
"""
from django.http import HttpResponse
import urllib2
from extdirect.django.decorators import remoting
from direct.providers import remote_provider
from visit.models import OrderedService, Visit
from collections import defaultdict
from django.utils import simplejson
from django.core.serializers.json import DjangoJSONEncoder
from remoting.utils import get_ordered_service, get_result, try_confirm
from remoting.models import Transaction, TransactionItem, SyncObject
from django.db.models.aggregates import Count
import logging
from urllib2 import HTTPError, URLError

logger = logging.getLogger('remoting')

def post_orders_to_local(request, data_set, options):
    result = []
    for data in data_set:
        success = True
        specimen_id = data['visit']['specimen']
        
        try:
            ord_service, created = get_ordered_service(request, data)
            status = created and u'успешно размещен' or u'уже был добавлен ранее'
            msg = u'Заказ "%s" для образца №%s %s' % (ord_service.service,specimen_id,status)
        except Exception, err:
            msg = err.__unicode__()
            success = False
            
        result.append({
            'order':specimen_id,
            'service':data['order']['code'],
            'success': success,
            'message':msg
        })

    return result

def post_results_to_local(request, data_set, options):

    result = []
    success_results = []
#    print "results:",data_set
    lab_orders = {}
    _visit_cache = {}
    ts = True
    for data in data_set:
        success = True
        specimen_id = data['visit']['specimen_id']
        name = data['result']['name']
        msg = u'Результат %s (%s) принят' % (data['result']['name'], specimen_id)
        
        try:
            res = get_result(request, data)
            success_results.append(res.id)
            if __debug__:
                print "success:", name
        except Exception, err:
            if __debug__:
                msg = err.__unicode__()
                print "failed:", name, " - ", msg
            success = False
            ts = False
        
        if success:
            if not lab_orders.has_key(res.order.id):
                lab_orders[res.order.id] = res.order

            
        result.append({
            'result':name,
            'specimen':specimen_id,
            'success': success,
            'message':msg
        })
        
#    print ts

    if 'services' in options and options['services'] and ts:
        try_confirm(specimen_id, options['services'])
    
    return result


ACTIONS = {
    'post_orders':post_orders_to_local,
    'post_results':post_results_to_local,
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
        result = func(request, data_set, options)
    
    return HttpResponse(simplejson.dumps(result), mimetype="application/json")    
    
def post_data_to_remote(lab, action, data, options={}):
    """
    """
    domain = lab.remotestate.domain_url
    url = 'remoting/router/'
    path = domain+url
    json_data = simplejson.dumps({ 
        'action':action,
        'data':data,
        'options':options
    }, cls=DjangoJSONEncoder)

    try:
        if __debug__:
            msg = u'Данные к отправке: %s' % unicode(json_data)
            print msg
            logger.debug(msg)

        req = urllib2.Request(path, json_data, {'Content-Type': 'application/json'})
        f = urllib2.urlopen(req)
        response = f.read()
        f.close()
        return simplejson.loads(response)
    except HTTPError, e:
        if __debug__:
            msg = u'Ошибка отправки данных: %s' % e.__unicode__()
            logger.exception(msg)
            print msg
            
            msg = e.read()
            logger.exception(msg)
            print msg
        
        raise HTTPError(e)


def post_results(lab_order, confirm):
    lab = lab_order.visit.office
    
    services = {}
    results = []
    for result in lab_order.result_set.all():
        a = result.analysis
        services[a.service.code] = True
        data = {
            'visit': {
                'specimen_id':lab_order.visit.specimen
            },
            'order': {
#                'id':1,
                'code':a.service.code
            },
            'result': {
                'name':a.name,
                'code':a.code,
                'value':result.value,
                'measurement':a.measurement and a.measurement.name,
                'ref_interval':a.ref_range_text
            }
        }
        results.append(data)
    
    options = {
        'confirm':confirm,
        'services':services.keys()
    }
    
#    data_set = simplejson.dumps(results)

#    transaction = Transaction.objects.create(type='lab.out',
#                                             sender=request.active_profile.department.state,
#                                             reciever=_labs_cache[lab])
#    msg = simplejson.dumps(results)
#    logger.debug(msg)
    result = post_data_to_remote(lab,'post_results',results, options)
    
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
        data = {
            'patient':{
                'id':p.id,
                'last_name':p.last_name,
                'first_name':p.first_name,
                'mid_name':p.mid_name,
                'birth_day':p.birth_day,
                'gender':p.gender,
                'mobile_phone':p.mobile_phone,
                'home_address_street':p.home_address_street
            },
            'order':{
                'id':obj.id,
                'code':obj.service.code
            },
            'visit':{
                'id':obj.order.id,
                'specimen':obj.order.specimen,
                'pregnancy_week':obj.order.pregnancy_week,
                'menses_day':obj.order.menses_day,
                'menopause':obj.order.menopause,
                'diagnosis':obj.order.diagnosis,
                'sampled':obj.order.sampled
            },
            'dest_lab':s.uuid,
            'source_lab':obj.order.office.uuid
        }
        labs[s.uuid].append(data)
        _labs_cache[s.uuid] = s
    
    for lab,data in labs.iteritems():
#        transaction = Transaction.objects.create(type='state.out',
#                                                 sender=request.active_profile.department.state,
#                                                 reciever=_labs_cache[lab])
        try:
            result = post_data_to_remote(_labs_cache[lab], 'post_orders', data)
        except URLError, e:
            return dict(success=False, data={'state':_labs_cache[lab].name,'reason':e.__unicode__()})
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