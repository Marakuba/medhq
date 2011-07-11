# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
import csv
from service.models import BaseService, ExtendedService
from state.models import State
from pricelist.models import Price

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        
        f = args[0]
        table = csv.reader(open(f,'r'), delimiter=",")
        
        _service_cache = {}
        _state_cache = {}
        
        for row in table:
            group, name, short_name, price, state = [unicode(col.strip(),'utf-8') for col in row]
            if name=='' and short_name=='':
                continue
            
            params = {
                'name':name,
                'short_name':short_name
            }
            
            if group:
                group_object = _service_cache.get(group, None)
                if not group_object:
                    group_object, created = BaseService.objects.get_or_create(name=group)
                    print created, group_object

                    if created:
                        _service_cache[group] = group_object
                    if group_object:
                        params['parent'] = group_object
            
            service, created = BaseService.objects.get_or_create(**params)
            print created, service
            
            if price!='' and state!='':
                
                state_object = _state_cache.get(state, None)
                if not state_object:
                    state_object, created = State.objects.get_or_create(name=state, print_name=state, official_title=state, type=u'm')
                    print created, state_object
                    if created:
                        _state_cache[state] = state_object
                    
                extended_service, created = ExtendedService.objects.get_or_create(base_service=service, state=state_object)
                print created, extended_service
                
                if price!=0:
                    price, created = Price.objects.get_or_create(extended_service=extended_service, price_type=u'r', value=price)
                    print created, price