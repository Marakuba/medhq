# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
import csv
from service.models import BaseService, ExtendedService
from state.models import State
from pricelist.models import Price
from django.core.exceptions import ObjectDoesNotExist

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        
        f = args[0]
        pt = args[1]
        table = csv.reader(open(f,'r'), delimiter=",")
        
        _service_cache = {}
        _state_cache = {}
        
        table.next()
        
        for row in table:
            id, group_id, group_name, name, short_name, state, price = [unicode(col.strip(),'utf-8') for col in row]
            if name=='' and short_name=='':
                continue
            
            params = {
                'id':id,
                'name':name,
                'short_name':short_name
            }
            
#            if group_id==u'.':
#                group_id=None
#            
#            if group:
#                group_object = _service_cache.get(group, None)
#                if not group_object:
#                    group_object, created = BaseService.objects.get_or_create(name=group)
#                    print created, group_object
#
#                    if created:
#                        _service_cache[group] = group_object
#                    if group_object:
#                        params['parent'] = group_object
            if id:
                print "ID", id
                try:
                    service = BaseService.objects.get(id=int(id))
                    service.name = name
                    service.short_name = short_name
                    service.save()
                except ObjectDoesNotExist:
                    print u'Услуга "%s" не найдена'
                    continue
            else:
                
                group = None
                if group_id:
                    group = _service_cache.get(group_id, None)
                    if not group:
                        try:
                            group = BaseService.objects.get(id=int(group_id))
                        except:
                            pass
                        
                service = BaseService.objects.create(parent=group, name=name, short_name=short_name)
                print u'Создана услуга:', service
            
            if state!='':
                
                state_object = _state_cache.get(state, None)
                if not state_object:
                    state_object, created = State.objects.get_or_create(name=state, 
                                                                        print_name=state, 
                                                                        official_title=state)
                    print u"Добавлена организация:", state_object
#                    if created:
                    _state_cache[state] = state_object
                    
                extended_service, created = ExtendedService.objects.get_or_create(base_service=service, 
                                                                                  state=state_object)
                if created:
                    print u'Добавлена расширенная услуга:', extended_service
                
                if price:
                    new_price, created = Price.objects.get_or_create(extended_service=extended_service,
                                                                     payment_type=pt, 
                                                                     price_type=u'r', 
                                                                     value=price)
                    if created:
                        print u'Установлена цена:', price
                else:
                    extended_service.is_active = False
                    extended_service.save()