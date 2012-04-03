# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
import csv
from service.models import BaseService
from state.models import State
from pricelist.models import Price
import datetime

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        
        f = args[0]
        state_name = args[1]
        price_type = args[2]
        try:
            on_date = args[3]
        except:
            on_date = datetime.date.today()
        
        try:
            state = State.objects.get(name=state_name)
        except:
            print u"Организация %s не найдена" % state_name
        
        table = csv.reader(open(f,'r'), delimiter=",")
        
        for row in table:
            sid, name, price = [unicode(col.strip(),'utf-8') for col in row]
            try:
                service = BaseService.objects.get(code="EM%s" % sid)
                ex = service.extendedservice_set.filter(state=state)
                if not len(ex):
                    print u"Услуга %s не выполняется в %s" % (name, state_name)
                    continue
                ex = ex[0]
                Price.objects.create(extended_service=ex, 
                                     price_type=price_type, 
                                     value=price,
                                     on_date=on_date)
                
                try:
                    analysis = service.analysis_set.get(name=service.name)
                    analysis.name = name
                    analysis.save()
                except:
                    pass
                
                service.name = name
                service.save()
                
                print u"Для услуги %s установлена цена %s" % (name, price)
            except:
                print u"Услуга %s не найдена" % name
