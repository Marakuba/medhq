# -*- coding: utf-8 -*-

from django.core.management.base import NoArgsCommand
from lab.models import LabOrder

class Command(NoArgsCommand):
    
    def handle_noargs(self, **options):
        
        orders = LabOrder.objects.all()#filter(is_completed=False)
        for order in orders:
            #print order
            flag = True
            for result in order.result_set.all():
                #print "\t",result.is_completed(), result
                flag = flag and result.is_completed()
            #if flag:
                #print order, flag
            order.is_completed = flag
            order.save()
            print order.__unicode__(), "order complete:", flag 