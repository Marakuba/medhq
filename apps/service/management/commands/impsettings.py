# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
from service.models import BaseService, BaseServiceGroup, LabServiceGroup,\
    ExecutionTypeGroup
import csv

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        base_groups = BaseServiceGroup.objects.all()
        lab_groups = LabServiceGroup.objects.all()
        exec_groups = ExecutionTypeGroup.objects.all()
        with open('extsettings.csv', 'r') as f:
            reader = csv.reader(f)
            for row in reader:
                service = BaseService.objects.get(id=row[0])
                service.base_group = base_groups.get(id=row[1])
                service.execution_type_group = exec_groups.get(id=row[2])
                if row[3]:
                    service.lab_group = lab_groups.get(id=row[3])
                service.manual = bool(row[4])
                service.individual_tube  = bool(row[5])
                service.save()
                print service
                
        