# -*- coding: utf-8 -*-

"""
"""

from django.core.management.base import NoArgsCommand
from visit.models import Visit
from numeration.models import Barcode


class Command(NoArgsCommand):

    def handle_noargs(self, *args, **options):
        """
        """
        visits = Visit.objects.filter(barcode__isnull=True).order_by('id',)
        for visit in visits:
            new_barcode = Barcode.objects.create()
            visit.barcode = new_barcode
            visit.save()
            print u"barcode %s for visit %s" % (new_barcode.id, visit)
