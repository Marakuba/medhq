# -*- coding: utf-8 -*-


from django.core.management.base import BaseCommand
from lab.models import Analysis
from utils.unicsv import UnicodeReader
from django.core.exceptions import ObjectDoesNotExist


class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        
        f = open(args[0], 'r')
        
        writer = UnicodeReader(f)
        
        for service_name,service_code,assay_name,assay_code in writer:
            try:
                assay = Analysis.objects.get(service__code=service_code,
                                             name=assay_name)
                assay.code = assay_code
                assay.save()
            except ObjectDoesNotExist:
                print u"Service '%s' (%s) with assay '%s' not found" % (service_name, service_code, assay_name)
            except Exception, err:
                print "Error:", err.__unicode__()