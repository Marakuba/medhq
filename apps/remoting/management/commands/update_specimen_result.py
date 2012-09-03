# -*- coding: utf-8 -*-

"""
"""

from django.core.management.base import BaseCommand
import datetime
import time
from remoting.utils import update_result_feed


class Command(BaseCommand):
    
    def handle(self, *args, **options):
        """
        """
        state_key = args[0]
        specimens = args[1:]
        
        update_result_feed(state_key, specimens=specimens)
            