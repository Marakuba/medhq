# -*- coding: utf-8 -*-


from django.core.management.base import NoArgsCommand
from lab.models import Analysis


class Command(NoArgsCommand):

    def handle_noargs(self, *args, **options):
        """
        """
        item_list = Analysis.objects.all()
        for item in item_list:
            service = item.service
            tubes = item.tube.all()
            for tube in tubes:
                service.normal_tubes.add(tube)
                service.transport_tubes.add(tube)
                service.save()
                print "U:", service
                
            