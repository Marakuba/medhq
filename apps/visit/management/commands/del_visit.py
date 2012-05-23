# -*- coding: utf-8 -*-

"""
"""

from django.core.management.base import BaseCommand
from visit.models import Visit

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        
        start = args[0]
        try:
            end = args[1]
        except:
            end = None
        
        if not end:
            lookups = {
                'barcode__id':int(start)
            }
        else:
            lookups = {
                'barcode__id__in':range(int(start), int(end)+1)
            }
        
        print "lookups", lookups
        
        visits = Visit.objects.filter(**lookups)
        
        for visit in visits:
            print visit, "laborders:", visit.laborder_set.all()
            visit.laborder_set.all().delete()
            
            print visit, "services:", visit.orderedservice_set.all()
            visit.orderedservice_set.all().delete()
        
        print "visits:", visits
        visits.delete()
            