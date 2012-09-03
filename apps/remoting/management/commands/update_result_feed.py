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
        
        try:
            update = bool(int(args[1]))
        except:
            update = True
        
        """
        DateTime Formats:
        YYYYMMMDDHHMMSS
        """
        try:
            start = args[2]
            start = datetime.datetime.strptime(start,"%Y%m%d%H%M%S")
        except:
            start = datetime.datetime.now()

        start = int(time.mktime(start.timetuple()))
    

        try:
            end = args[3]
            end = datetime.datetime.strptime(end,"%Y%m%d%H%M%S")
            end = time.mktime(end.timetuple())
        except:
            end = None
        
        
        update_result_feed(state_key, start, end, update=update)
            