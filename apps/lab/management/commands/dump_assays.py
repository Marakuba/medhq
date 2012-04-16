# -*- coding: utf-8 -*-


from django.core.management.base import BaseCommand
from lab.models import Analysis
from utils.unicsv import UnicodeWriter


class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        
        f = open(args[0], 'w')
        
        writer = UnicodeWriter(f)
        
        assays = Analysis.objects.all().order_by('service__name','name')
        
        rows = [ [a.service.name, a.service.code, a.name, a.code] for a in assays ]
        
        writer.writerows(rows)