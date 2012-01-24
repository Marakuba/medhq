# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
import csv
from service.models import BaseService, ExtendedService
from state.models import State
from pricelist.models import Price
import cStringIO
import codecs


class UnicodeWriter:
    """
    A CSV writer which will write rows to CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        # Redirect output to a queue
        self.queue = cStringIO.StringIO()
        self.writer = csv.writer(self.queue, dialect=dialect, **kwds)
        self.stream = f
        self.encoder = codecs.getincrementalencoder(encoding)()

    def writerow(self, row):
        self.writer.writerow([s.encode("utf-8") for s in row])
        # Fetch UTF-8 output from the queue ...
        data = self.queue.getvalue()
        data = data.decode("utf-8")
        # ... and reencode it into the target encoding
        data = self.encoder.encode(data)
        # write to the target stream
        self.stream.write(data)
        # empty queue
        self.queue.truncate(0)

    def writerows(self, rows):
        for row in rows:
            self.writerow(row)

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        
        f = args[0]
        table = UnicodeWriter(open(f,'wb'), delimiter=",")
        rows = [[u'ID услуги',u'extID',u'Группа',u'Услуга',u'Краткое наименование',u'Организация',u'Активно',u'Цена (руб.коп)']]
        services = BaseService.objects.all().order_by(BaseService._meta.tree_id_attr, BaseService._meta.left_attr, 'level')
        for service in services:
            if not service.is_leaf_node():
                rows.append([str(service.id), 
                             u'', 
                             service.parent and service.parent.name or u'.',
                             service.name,
                             service.short_name,
                             u'',
                             u'',
                             u''])
            else:
                for item in service.extendedservice_set.all():
                    price = item.get_actual_price()
                    rows.append([str(service.id), 
                                 str(item.id), 
                                 service.parent and service.parent.name or u'.',
                                 service.name,
                                 service.short_name,
                                 item.state.name,
                                 item.is_active and "+" or "-",
                                 price and str(price) or u''])
        
        table.writerows(rows)
