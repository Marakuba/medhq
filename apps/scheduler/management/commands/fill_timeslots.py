# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
import csv
from scheduler.models import Event
from staff.models import Position
from datetime import timedelta
import pdb
class Command(BaseCommand):
    
    def handle(self, *args, **options):
        """
        """
        def has_timeslot(arr,start):
#            print len(arr)
            it_has = False
#            pdb.set_trace()
            for item in arr:
#                print item.start
                if item.start == start:
                    it_has = True
            print "%s - %s" % (it_has, start)
            return it_has
            
        shifts = Event.objects.filter(timeslot = False)
        for s in shifts:
#            print s.start
            
            staff = Position.objects.get(id=s.cid)
            timeslot = timedelta(minutes=staff.staff.doctor.get_timeslot_display() or 30)
            start = s.start
            end = s.end
            timeslots = Event.objects.filter(timeslot = True,start__gte = start, start__lte=end,cid = s.cid)
            while start < end:
#                print start
                if not has_timeslot(timeslots,start):
                    print s.start
                    Event.objects.create(staff = s.staff, cid = s.cid,title='',start = start,\
                                         end = start+timeslot, timeslot = True, vacant = True, n = False, \
                                         parent = s, rem = s.rem)
                start += timeslot
            
            
            
            
