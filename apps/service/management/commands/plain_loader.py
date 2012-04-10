# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
import csv
from service.models import BaseService
from state.models import State
from pricelist.models import Price
import datetime
from optparse import make_option

class Command(BaseCommand):

    option_list = BaseCommand.option_list + (
        make_option('--pricetype', action='store', dest='pricetype',
            default=None, help=u'Тип цены: r - розничная, z - закупочная'),
        make_option('--paymenttype', action='store', dest='paymenttype',
            default=None, help=u'Тип цены: н - касса, б - юрлицо, д - ДМС, к - корпоративные расчеты'),
        make_option('--ondate', action='store', dest='ondate',
            default='medhqjson', help=u'Дата активации цен. По умолчанию текущая'),
        make_option('--payer', action='store', dest='payer',
            help=u'Организация-плательщик. Если не указано, то цена задается для плательщиков-физлиц'),
        make_option('--state', action='store', dest='state',
            help=u'Организация, которая будет указана в расширенной услуге'),
    )
    
    def err(self, text):
        self.stderr.write(self.style.ERROR(u"%s\n" % text))
    
    def notice(self, text):
        self.stderr.write(self.style.NOTICE(u"%s\n" % text))
    
    def handle(self, *args, **options):
        """
        """
        
        f = args[0]
        state_name = options.get('state')
        price_type = options.get('pricetype', u'r')
        payment_type = options.get('paymenttype', u'н')
        on_date = options.get('ondate', datetime.date.today())
        payer_name = options.get('payer')
        
        try:
            state = State.objects.get(name=state_name)
        except:
            self.err(u"Организация %s не найдена" % state_name)
            return
        if payer_name:
            try:
                payer = State.objects.get(name=payer_name)
            except:
                self.err(u"Организация %s не найдена" % payer_name)
                return
        
        table = csv.reader(open(f,'r'), delimiter=",")
        
        for row in table:
            code, name, price = [unicode(col.strip(),'utf-8') for col in row]
            try:
                service = BaseService.objects.get(code=code)
                ex = service.extendedservice_set.filter(state=state)
                if not len(ex):
                    self.notice( u"Услуга %s не выполняется в %s" % (name, state_name) )
                    continue
                ex = ex[0]
                params = dict(extended_service=ex, 
                                     price_type=price_type,
                                     payment_type=payment_type,
                                     value=price,
                                     on_date=on_date)
                if payer:
                    params['payer'] = payer
                Price.objects.create(**params)
                
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
                self.err( u"Услуга %s не найдена" % name )
