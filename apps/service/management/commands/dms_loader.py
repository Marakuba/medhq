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
            group, name, short_name, old_price, price = [unicode(col.strip(),'utf-8') for col in row]
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
                    if created:
                        print u'Группа:',group_object

                    if created:
                        _service_cache[group] = group_object
                    if group_object:
                        params['parent'] = group_object
            
            try:
                service, created = BaseService.objects.get_or_create(**params)
                if created:
                    print u"Услуга:", service
            except Exception, err:
                print err, name
            
            if price!='':
                
#                state_object = _state_cache.get(state, None)
#                if not state_object:
#                    state_object, created = State.objects.get_or_create(name=state, print_name=state, official_title=state, type=u'm')
#                    print created, state_object
#                    if created:
#                        _state_cache[state] = state_object
                    
                extended_service = ExtendedService.objects.latest('id')
#                print created, extended_service
                
                if price!=0:
                    try:
                        new_price, created = Price.objects.get_or_create(extended_service=extended_service,
                                                                     payment_type=u'д', 
                                                                     price_type=u'r', 
                                                                     value=price)
#                        print "\t",price
                    except Exception, err:
                        print err, price