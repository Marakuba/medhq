# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand, CommandError
import csv
from patient.models import Patient
import datetime
from pricelist.models import Discount
from django.contrib.auth.models import User

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        
        f = args[0]
        table = csv.reader(open(f,'r'))
        
        discounts = {
            '0':None,
            '4':Discount.objects.get(id=1),
            '1':Discount.objects.get(id=2),
            '2':Discount.objects.get(id=3),
            '3':Discount.objects.get(id=4),
            'pens':Discount.objects.get(id=5)
        }
        
        c = 0
        operator = User.objects.get(username='trx')
        for i,row in enumerate(table):
            ln,fn,mn,bd,ha,phone,dsc,doc = [col.strip() for col in row]
            ptn = " ".join([ln,fn,mn])
            try:
                dt = datetime.datetime.strptime(bd,'%Y-%m-%d 00:00:00.000')
                db = datetime.date(dt.year,dt.month,dt.day)
                
                if dsc=='3' and doc:
                    dsc = 'pens'
                discount = discounts.get(dsc,None)
                try:
                    patient = Patient.objects.get(last_name__istartswith=ln,
                                                  first_name__istartswith=fn,
                                                  mid_name__istartswith=mn)
                    if discount:
                        patient.discount = discount
                        patient.doc = doc
                        patient.save()
                    print "existing", patient
                except:
                    patient = Patient.objects.create(operator=operator,
                                                     last_name=ln,
                                                     first_name=fn,
                                                     mid_name=mn,
                                                     birth_day=db,
                                                     gender=u'М',
                                                     discount=discount,
                                                     doc=doc
                                                     )
                    print "created", ptn, "- doc:", doc, discount
            except ValueError:
#                print "date incorrect, passed", bd
                pass
        
                