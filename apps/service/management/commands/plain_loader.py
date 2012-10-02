# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
import csv
from service.models import BaseService
from state.models import State
from pricelist.models import Price, PriceType
import datetime
from optparse import make_option
from django.core.exceptions import ObjectDoesNotExist

class Command(BaseCommand):
    
    help = "manage.py plain_loader csv_file [options]"

    option_list = BaseCommand.option_list + (
        make_option('--pricetype', action='store', dest='pricetype',
            default='r', help=u'Тип цены: r - розничная, z - закупочная'),
        make_option('--ptype', action='store', dest='ptype',
            default=None, help=u'Тип прайс-листа'),
        make_option('--paymenttype', action='store', dest='paymenttype',
            default=None, help=u'Тип цены: н - касса, б - юрлицо, д - ДМС, к - корпоративные расчеты'),
        make_option('--ondate', action='store', dest='ondate',default=datetime.date.today(),
            help=u'Дата активации цен. По умолчанию текущая'),
        make_option('--payer', action='store', dest='payer',
            help=u'Организация-плательщик. Если не указано, то цена задается для плательщиков-физлиц'),
        make_option('--state', action='store', dest='state',
            default=None, help=u'Организация, которая будет указана в расширенной услуге'),
    )
    
    def err(self, text):
        self.stderr.write(self.style.ERROR(u"%s\n" % text))
    
    def notice(self, text):
        self.stderr.write(self.style.NOTICE(u"%s\n" % text))
    
    def handle(self, *args, **options):
        """
        """
        
        f = args[0]
        state = options.get('state')
        price_type = options.get('pricetype', u'r')
        payment_type = options.get('paymenttype', u'н')
        ptype = options.get('ptype')
        on_date = options.get('ondate', datetime.date.today())
        payer = unicode(options.get('payer'), 'utf-8')
        
        
        if state:
            try:
                state = State.objects.get(name=state)
            except:
                self.err(u"Организация %s не найдена" % state)
                return
        
        if payer:
            try:
                payer = State.objects.get(name=payer)
            except:
                self.err(u"Организация %s не найдена" % payer)
                return

        try:
            ptype = PriceType.objects.get(name=ptype)
        except:
            self.err(u"Тип прайс-листа %s не найден" % ptype)
            return
        
        
        table = csv.reader(open(f,'r'), delimiter=",")
        
        for row in table:
            code, name, price = [unicode(col.strip(),'utf-8') for col in row]
            
            #skip groups
            if not name and not price: continue
            
            try:
                service = BaseService.objects.get(code=code)
            except ObjectDoesNotExist:
                print u"Услуга %s (%s) не найдена" % (name,code)
                continue
            except Exception, err:
                self.err( u"При поиске услуги %s произошла ошибка: %s" (name, err.__unicode__()) )
                continue
            
            ex_set = service.extendedservice_set.all()
            if state:
                ex_set = ex_set.filter(state=state)
            if not len(ex_set):
                print u"!!!Услуга %s не выполняется в %s" % (name, state) 
                continue
            for ex in ex_set:
                params = dict(type=ptype,
                              extended_service=ex, 
                              price_type=price_type,
                              payment_type=payment_type,
                              value=price,
                              on_date=on_date)
                if payer:
                    params['payer'] = payer
                
                Price.objects.filter(**params).delete()
                Price.objects.get_or_create(**params)
            
            
            print u"Для услуги %s установлена цена %s" % (name, price)
