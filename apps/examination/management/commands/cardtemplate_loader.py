# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
import csv
from staff.models import Position
from examination.models import CardTemplate, TemplateGroup

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        
        f = args[0]
        table = csv.reader(open(f,'r'), delimiter=",")
        header = table.next()
        
        for row in table:
            name, objective_data, user, group = [unicode(col.strip(),'utf-8') for col in row]
            if group:
                group, created = TemplateGroup.objects.get_or_create(name=group)
            else:
                group=None
            new_tpl = CardTemplate(name=name,objective_data=objective_data, group=group)
            try:
                user = int(user)
                pos = Position.objects.get(id=user)
                new_tpl.staff = pos
            except:
                pass
            new_tpl.save()
            
