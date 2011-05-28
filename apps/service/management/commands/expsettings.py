# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
from service.models import BaseService
import csv

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        with open('extsettings.csv', 'w') as f:
            writer = csv.writer(f)
            services = BaseService.objects.all()
            for service in services:
                row = [service.id,
                       service.base_group.id, 
                       service.execution_type_group.id,
                       service.lab_group and service.lab_group.id or '',
                       int(service.manual),
                       int(service.individual_tube)]
                writer.writerow(row)
        