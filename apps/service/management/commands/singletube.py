# -*- coding: utf-8 -*-

"""
"""

from django.core.management.base import NoArgsCommand
from service.models import BaseService


class Command(NoArgsCommand):

    def handle_noargs(self, *args, **options):
        """
        """
        services = BaseService.objects.all()
        for service in services:
            tubes = service.normal_tubes.all()
            if tubes:
                service.tube = tubes[0]
                print "service:",service
                print "\ttube to set:", tubes[0]
                service.save()