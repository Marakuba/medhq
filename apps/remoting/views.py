# -*- coding: utf-8 -*-

"""
"""
from django.http import HttpResponse
import simplejson
import urllib2

def send(request):
    """
    """
    domain = 'http://127.0.0.1:8000'
    url = '/'
    path = domain + url
    data = [{
        'laboratory':'euromed',
        'patients':[{
            'last_name':'ivanov',
            'birth_date':'02.01.1990',
            'orders':[{
                'id':12345,
                'services':[{
                    'code':'EM1422'
                },{
                    'code':'EM135'
                }]
            }]
        }]
    }]
    response = None
    json_data = simplejson.dumps(data)
    req = urllib2.Request("http://localhost:8000/remoting/recieve/", json_data, {'Content-Type': 'application/json'})
    f = urllib2.urlopen(req)
    response = f.read()
    f.close()
    return HttpResponse('sended. response: %s' % response)    


def recieve(request):
    """
    """
    data = simplejson.loads(request.raw_post_data)
    print data
    return HttpResponse('recieved')