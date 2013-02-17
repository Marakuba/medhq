# -*- coding: utf-8 -*-

import simplejson
from extdirect.django.decorators import remoting

from scheduler.models import Preorder, Event
from direct.providers import remote_provider


@remoting(remote_provider, len=1, action='scheduler', name='hasPreorder')
def has_preorder(request):
    data = {
        'success': True,
        'hasPreorder': False
    }
    r = simplejson.loads(request.raw_post_data)
    try:
        service_id = int(r['data'][0])
        event = Event.objects.get(id=service_id)
    except:
        event = None
    if event:
        timeslots = Event.objects.filter(timeslot=True, start__gte=event.start, start__lte=event.end)
        for timeslot in timeslots:
            preorders = Preorder.objects.filter(timeslot=timeslot)
            if preorders:
                data['hasPreorder'] = True
    return data
