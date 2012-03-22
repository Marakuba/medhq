# -*- coding: utf-8 -*-

from direct.providers import remote_provider
from extdirect.django.decorators import remoting
import simplejson
from service.models import BaseService, ExtendedService


@remoting(remote_provider, len=1, action='service', name='getActualPrice')
def get_actual_price(request):
    data = simplejson.loads(request.raw_post_data)
    services = data['data'][0]['services']
    state = data['data'][0]['state']
    ptype = data['data'][0]['ptype']
    if data['data'][0].has_key('payer'):
        payer = data['data'][0]['payer']
    else:
        payer = None
    data = {}
    for id in services:
        try:
            ext_serv = ExtendedService.objects.get(base_service=id,state=state)
        except:
            ext_serv = None
        if ext_serv:
            price = ext_serv.get_actual_price(payment_type=ptype,payer = payer)
            data[id] = price
    return dict(success=True, data=simplejson.dumps(data))