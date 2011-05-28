# -*- coding: utf-8 -*-


from django.core.management.base import NoArgsCommand
from visit.models import Visit


class Command(NoArgsCommand):

    def handle_noargs(self, *args, **options):
        """
        """
        visits = Visit.objects.filter(total_price=0)
        for visit in visits:
            sum = 0
            for order in visit.orderedservice_set.all():
                price = order.service.price()
                order.price = price
                order.save()
                sum+=price
            visit.total_price = sum
            visit.save()
            print "Visit #%s updated" % visit.zid()