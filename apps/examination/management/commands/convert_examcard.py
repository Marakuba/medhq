# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
from examination.models import  ExaminationCard, Card

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        err_count = 0
        count = 0
        objects = ExaminationCard.objects.all()
        for obj in objects:
            try:
                attributes = obj.getAttributes()
                Card.objects.create(**attributes)
                count += 1
            except:
                err_count += 1
                print 'Error! %s card %s' % (err_count, obj.__unicode__())
                
        print 'Converted %s card(s)' % (count)
                