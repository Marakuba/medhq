# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand, CommandError
import csv
from state.models import State
from service.models import BaseService, ExecutionPlace
from django.conf import settings
from pricelist.models import PriceType, Price
import datetime

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        
        slugs = ('em_retail','kdl_income','dc_income')
        types = {}
        for slug in slugs:
            types[slug] = PriceType.objects.get(slug=slug)
        
        
        f = args[0]
        table = csv.reader(open(f,'r'), delimiter=",")
        
        header = table.next()
        
        id_list = []
        
        for i,row in enumerate(table):
            id,parent,name,short_name,exec_time,price,material,klc,dc,etc = [unicode(col.strip(),'utf-8') for col in row]
            if not parent:
                continue
            try:
                service = BaseService.objects.get(name=name)
                if not price:
                    pass
                    #print u'no price for --%s--' % name
                else:
                    new_price, created = Price.objects.get_or_create(service=service,
                                                                     type=types['em_retail'],
                                                                     on_date=datetime.date.today())
                    new_price.value = price
                    new_price.save()
                if klc:
                    new_price, created = Price.objects.get_or_create(service=service,
                                                                     type=types['kdl_income'],
                                                                     on_date=datetime.date.today())
                    new_price.value = klc
                    new_price.save()
                if dc:
                    new_price, created = Price.objects.get_or_create(service=service,
                                                                     type=types['dc_income'],
                                                                     on_date=datetime.date.today())
                    new_price.value = dc
                    new_price.save()
                id_list.append(service.id)
            except Exception, err:
                print err, name
                #print u"service --%s-- not found" % name
        
        exclude = BaseService.objects.actual().exclude(id__in=id_list)
        for item in exclude:
            pass
            #print "item --%s-- not in list" % item.name
        print "parsed"
