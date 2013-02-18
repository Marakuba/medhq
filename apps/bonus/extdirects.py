# -*- coding: utf-8 -*-


import simplejson

from direct.providers import remote_provider
from extdirect.django.decorators import remoting

from .utils import process_calculation, get_category_result


@remoting(remote_provider, len=1, action='bonus', name='processCalculation')
def _process_calculation(request):
    """
    """
    data = simplejson.loads(request.raw_post_data)
    calculation_id = data['data'][0]

    amount = process_calculation(calculation_id)

    return {
        'success': True,
        'amount': amount
    }


@remoting(remote_provider, len=1, action='bonus', name='getCategoryResult')
def _get_category_result(request):
    """
    """
    data = simplejson.loads(request.raw_post_data)
    calculation_id = data['data'][0]

    rows, cols = get_category_result(calculation_id)
    return {
        'success': True,
        'rows': [dict(zip(cols, row)) for row in rows]
    }
