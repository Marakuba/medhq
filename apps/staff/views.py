# -*- coding: utf-8 -*-

from direct.providers import remote_provider
from extdirect.django.decorators import remoting
from service.models import BaseService, ExtendedService
import simplejson
from state.models import State
import datetime
from scheduler.models import Event
from visit.models import OrderedService

@remoting(remote_provider, len=1, action='staff', name='getWorkedStaff')
def get_actual_price(request):
    
    data = simplejson.loads(request.raw_post_data)
    service_id = data['data'][0]['service']
    state_id = data['data'][0]['state']
    
    service = ExtendedService.objects.get(base_service=service_id,state=state_id)
    staff_list = []
    now = datetime.datetime.now()
    day_start = now.replace(hour=0,minute=0,second=0,microsecond=1)
    day_end = now.replace(hour=23,minute=59,second=59,microsecond=999999)
    for staff in service.staff.all():
        d = OrderedService.objects.filter(created__gte = day_start, created__lte=day_end,executed__isnull=True,staff = staff.id)
        queue = len(d)
        shift = Event.objects.filter(cid=staff.id,start__lte=now,end__gte=now,timeslot=False)
        if shift:
            start_time =shift[0].start
            end_time = shift[0].end
            has_shift = 0
            
        else:
            has_shift = 1
#            queue=0
            start_time = end_time = '---' 
        staff_item = [staff.id,staff.short_name(),staff.title,start_time,end_time,queue,has_shift]
        staff_list.append(staff_item)
    
    #Сортируем по имени врача
    staff_list.sort(key=lambda k: (k[6],k[5],k[1])) 

    new_data = {}
    new_data['staffs'] = staff_list
    return dict(success=True, data=new_data)