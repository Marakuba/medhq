# -*- coding: utf-8 -*-

import simplejson

from direct.providers import remote_provider
from extdirect.django.decorators import remoting

from store.models import Product


POINTS = {
    'above': 'left',
    'below': 'right'
}


@remoting(remote_provider, len=3, action='store', name='moveNode')
def move_node(request):

    r = simplejson.loads(request.raw_post_data)
    # print r['data']
    try:
        drop_node = Product.objects.get(id=int(r['data'][0]))
    except Exception:
        return dict(success=False, msg=u"Drop node not found")

    try:
        target_node = Product.objects.get(id=int(r['data'][1]))
    except Exception:
        return dict(success=False, msg=u"Target node not found")

    point = r['data'][2]
    if point not in POINTS:
        return dict(success=False, msg=u"Неправильная позиция")

    drop_node.move_to(target_node, position=POINTS[point])

    return dict(success=True, msg=u"OK")
