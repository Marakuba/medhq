# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand, CommandError
import csv
import datetime
from pricelist.models import get_actual_ptype
from state.models import State
from service.models import ExtendedService


class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        # day_07_59 = datetime.datetime(year=2012, month=12, day=6, hour=7, minute=32)
        # hol_07_59 = datetime.datetime(year=2012, month=12, day=8, hour=7, minute=32)
        # day_23_59 = datetime.datetime(year=2012, month=12, day=6, hour=23, minute=32)
        # day_06_59 = datetime.datetime(year=2012, month=12, day=6, hour=7, minute=32)
        # print get_actual_ptype(date=day_07_59)
        # print get_actual_ptype(date=hol_07_59)
        # print get_actual_ptype(date=day_23_59)
        # print get_actual_ptype(date=day_06_59)
        # es = ExtendedService.objects.get(base_service__name='test_serv')
        # payer = State.objects.get(name='payer')
        # print es.get_actual_price(payer=payer.id)
        pass
