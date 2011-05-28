# -*- coding: utf-8 -*-

from django.core.management.base import NoArgsCommand
from visit.models import OrderedService
from lab.models import LabOrder, Result

class Command(NoArgsCommand):

    def handle_noargs(self, *args, **options):
        """
        """
        ordered_services = OrderedService.objects.all()
        for obj in ordered_services:
            visit = obj.order
            if obj.service.execution_form in (u'п',u'д'):
                try:
                    lab_order, created = LabOrder.objects.get_or_create(visit=obj.order, 
                                                                        laboratory=obj.execution_place)
                    if created:
                        print lab_order
                    for item in obj.service.analysis_set.all():
                        result, created = Result.objects.get_or_create(order=lab_order,analysis=item)
                        if created:
                            print result
                except Exception, err:
                    print err
                    