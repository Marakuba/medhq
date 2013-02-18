# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand, CommandError
import csv
import datetime
from pricelist.utils import get_actual_ptype
from state.models import State
from service.models import ExtendedService
from django.test.client import Client


class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        day_07_59 = datetime.datetime(year=2012, month=12, day=6, hour=7, minute=32)
        # hol_07_59 = datetime.datetime(year=2012, month=12, day=8, hour=7, minute=32)
        # day_23_59 = datetime.datetime(year=2012, month=12, day=6, hour=23, minute=32)
        # day_06_59 = datetime.datetime(year=2012, month=12, day=6, hour=7, minute=32)
        # print get_actual_ptype(date=day_07_59)
        # print get_actual_ptype(date=hol_07_59)
        # print get_actual_ptype(date=day_23_59)
        # print get_actual_ptype(date=day_06_59)
        # payer = State.objects.get(name='payer3')
        # print get_actual_ptype(date=day_07_59,
        #                        payment_type=u'к',
        #                        payer=payer.id)
        # es = ExtendedService.objects.get(base_service__name='test_serv')
        # es.get_price()
        try:
            payer = State.objects.get(name='payer2').id
        except:
            payer = None
        # print es.get_actual_price(payer=payer.id)
        client = Client()
        client.login(username='user2', password='123')
        response = client.get('/service/service_tree/',
                              {
                              'all': True
                                # 'payer': payer,
                                # 'on_date': datetime.date(year=2012,
                                #                          month=1,
                                #                          day=1),
                                # 'payment_type': u'н'
                               })
        import pdb; pdb.set_trace()
        pass
