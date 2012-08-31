# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
from examination.models import CardTemplate, Template

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        count = 0
        err_count = 0
        objects = CardTemplate.objects.all()
        for obj in objects:
            try:
                attributes = obj.getAttributes()
                Template.objects.create(**attributes)
                count += 1
            except:
                err_count += 1
                print 'Error! %s card %s' % (err_count, obj.__unicode__())
        print 'Converted %s templates(s)' % (count)