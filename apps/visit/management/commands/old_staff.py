# -*- coding: utf-8 -*-


from django.core.management.base import NoArgsCommand
from visit.models import Visit, Payment
from staff.models import Position


class Command(NoArgsCommand):

    def handle_noargs(self, *args, **options):
        """
        """
        visits = Visit.objects.exclude(staff=None)
        for visit in visits:
            service, staff = visit.staff[0].split(":") 
            s = visit.orderedservice_set.filter(service__id=int(service))
            if len(s):
                obj = s[0]
                obj.staff = Position.objects.filter(staff__id=int(staff))[0]
                obj.save()
                
