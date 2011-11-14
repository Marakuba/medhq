# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
import csv
from scheduler.models import Event
from staff.models import Position
from datetime import timedelta
class Command(BaseCommand):
    
    def handle(self, *args, **options):
        """
        """
        def has_timeslot(arr,start):
            it_has = False
            for item in arr:
                if item.start == start:
                    it_has = True
            return it_has
            
        shifts = Event.objects.filter(timeslot = False)
        for s in shifts:
            staff = Position.objects.get(id=s.cid)
            timeslot = timedelta(minutes=staff.staff.doctor.get_timeslot_display() or 30)
            start = s.start
            end = s.end
            timeslots = Event.objects.filter(timeslot = True,start__gte = start, start__lte=end,cid = s.cid)
            while start < end:
                if not has_timeslot(timeslots,start):
                    Event.objects.create(staff = s.staff, cid = s.cid,title='',start = start,\
                                         end = start+timeslot, timeslot = True, vacant = True, n = False, \
                                         parent = s, rem = s.rem)
                start += timeslot
            
            
            
            
