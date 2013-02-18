# -*- coding: utf-8 -*-

"""
"""
from django.http import HttpResponse
from django.utils import simplejson
from remoting.utils import post_orders_to_local, post_results_to_local


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
