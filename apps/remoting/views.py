# -*- coding: utf-8 -*-

"""
"""
from django.http import HttpResponse
import urllib2
from extdirect.django.decorators import remoting
from direct.providers import remote_provider
from visit.models import OrderedService
from collections import defaultdict
import os
from state.models import State
from django.utils import simplejson
from django.core.serializers.json import DjangoJSONEncoder
from remoting.utils import get_patient, get_ordered_service
from remoting.models import Transaction, TransactionItem

def send_to_lab(lab,data):
    """
    """
    domain = lab.remotestate.domain_url
    url = 'remoting/router/'
    path = domain+url
    json_data = simplejson.dumps(data,cls=DjangoJSONEncoder)
    try:
        req = urllib2.Request(path, json_data, {'Content-Type': 'application/json'})
        print 'data to send:',json_data
        f = urllib2.urlopen(req)
        response = f.read()
        f.close()
    except Exception, err:
        print 'error:',err
    return simplejson.loads(response)    


def router(request):
    """
    """
    result = []
    data_set = simplejson.loads(request.raw_post_data)
    for data in data_set:
        success = True
        err = None
        id = data['order']['id']
        
        try:
            ordered_service = get_ordered_service(request, data)
            success = ordered_service is not None
            err = success and (u'Заказ №%s успешно размещен' % id) or (u'Ошибка размещения заказа №%s' % id)
        except Exception, err:
            success = False
            
        result.append({
            'order':id,
            'success': success,
            'message':hasattr(err, '__unicode__') and err.__unicode__() or err
        })

    return HttpResponse(simplejson.dumps(result), mimetype="application/json")    
    

@remoting(remote_provider, len=1, action='remoting', name='send')
def send(request):
    """
    """
    data = simplejson.loads(request.raw_post_data)
    ids = data['data'][0]
    object_list = OrderedService.objects.filter(id__in=ids)
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
            },
            'order':{
                'id':obj.id,
                'code':obj.service.code
            },
            'visit':{
                'id':obj.order.id
            },
            'dest_lab':s.uuid,
            'source_lab':obj.order.office.uuid
        }
        labs[s.uuid].append(data)
        _labs_cache[s.uuid] = s
    
    for lab,data in labs.iteritems():
        transaction = Transaction.objects.create(type='state.out',
                                                 sender=request.active_profile.department.state,
                                                 reciever=_labs_cache[lab])
        result = send_to_lab(_labs_cache[lab], data)
        
        success = []
        error = []
    
        for r in result:
            ordered_service = _object_list_cache[r['order']]
            if r['success']:
                success.append(r['order'])
            else:
                error.append(r['order'])
            status = r['success'] and 'complete' or 'error'
            TransactionItem.objects.create(transaction=transaction,
                                           status=status,
                                           content_object=ordered_service,
                                           message=r['message'])
            
        OrderedService.objects.filter(id__in=success).update(status=u'>')
        OrderedService.objects.filter(id__in=error).update(status=u'!')
        
    return dict(success=True, data=result)