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
        state_name = args[1]
        
        try:
            state = State.objects.get(name=state_name)
        except:
            print u"Организация %s не найдена" % state_name
        
        table = csv.reader(open(f,'r'), delimiter=",")
        
        for row in table:
            id, name, price = [unicode(col.strip(),'utf-8') for col in row]
            try:
                service = BaseService.objects.get(code="EM%s" % id)
                ex = service.extendedservice_set.filter(state=state)
                if not len(ex):
                    print u"Услуга %s не выполняется в %s" % (name, state_name)
                    continue
                ex = ex[0]
                Price.objects.create(extended_service=ex, price_type=u'r', value=price)
                print u"Для услуги %s установлена цена %s" % (name, price)
            except:
                print u"Услуга %s не найдена" % name
