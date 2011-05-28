# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand, CommandError
import csv
from state.models import State
from service.models import BaseService, ExecutionPlace
from django.conf import settings
from pricelist.models import Price, PriceType
import datetime

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        
        f = args[0]
        table = csv.reader(open(f,'r'), delimiter=",")
        
        
        pl = State.objects.get(id=settings.MAIN_STATE_ID)

        slugs = ('em_retail','kdl_income','dc_income')
        types = {}
        for slug in slugs:
            types[slug] = PriceType.objects.get(slug=slug)
        
        level = 1
        groups = None
        new_service = None
        
        for i,row in enumerate(table):
            #print row
            try:
                l,name,short_name,price = [col.strip() for col in row]
                l = int(l)
                print i,l,name
                if l==1:
                    groups = [None]
                    level = 1
                    
                if l!=level:
                    if l>level:
                        groups.append(new_service)
                    elif l<level:
                        groups.pop(-1)
                    level = l
        
                new_service, created = BaseService.objects.get_or_create(name=name, short_name=short_name)
                new_service.parent = groups[level-1]
                new_service.version +=1
                new_service.save()
    
                if price:
                    new_price, created = Price.objects.get_or_create(service=new_service,
                                                                     type=types['em_retail'],
                                                                     on_date=datetime.date.today())
                    new_price.value = price
                    new_price.save()            
    
                ExecutionPlace.objects.create(state=pl, base_service=new_service, is_prefer=True)
            except Exception, err:
                print "error occured: %s" % err
                        