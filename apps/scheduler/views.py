# -*- coding: utf-8 -*-
from scheduler.models import Preorder,Event
from django.http import HttpResponse

def hasPreorder(request,id):
    has_preorder = 'NO'
    try:
        event = Event.objects.get(id=id)
    except:
        event = None
    if event:
        timeslots = Event.objects.filter(timeslot=True,start__gte=event.start,start__lte=event.end)
        for timeslot in timeslots:
            preorders = Preorder.objects.filter(timeslot=timeslot)
            if preorders:
                has_preorder='YES'
    response =  HttpResponse(has_preorder) 
    return response