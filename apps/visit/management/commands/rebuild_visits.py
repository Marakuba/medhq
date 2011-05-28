# -*- coding: utf-8 -*-


from django.core.management.base import NoArgsCommand
from visit.models import Visit, Payment


class Command(NoArgsCommand):

    def handle_noargs(self, *args, **options):
        """
        """
        payments = Payment.objects.filter(comment__icontains=u'материал')
        for payment in payments:
            for visit in payment.visits.all():
                print visit
                visit.cls = u'б'
                visit.save()