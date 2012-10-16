# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand, CommandError
import csv
from state.models import State
from service.models import BaseService, ExecutionPlace, ExtendedService
from django.conf import settings
from pricelist.models import Price, PriceType
import datetime
from constance import config
from core.utils import copy_model_object

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        
        ext_service_id = args[0]
        state_id = args[1]
        
        ext_service = ExtendedService.objects.get(id=ext_service_id)
        state = State.objects.get(id=state_id)
        
        print ext_service, state
        
        new_ex = copy_model_object(ext_service,
                          copy_rels=['pricelist:price',],
                          values={
                                  '_':{
                                       'state':state
                                    }
                                  })
        
        print new_ex, new_ex.id