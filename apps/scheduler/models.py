# -*- coding: utf-8 -*-

from django.db import models, transaction
from django.contrib.auth.models import User
import datetime
from core.models import make_operator_object
from south.modelsinspector import add_introspection_rules
from django.utils.encoding import smart_unicode, force_unicode, smart_str
import time
from visit.settings import PAYMENT_TYPES
from staff.models import Staff, Position
from patient.models import Patient
from mptt.models import MPTTModel
from visit.models import BaseService
from state.models import State
from django.conf import settings
from visit.models import Visit
from django.db.models.signals import pre_delete
import exceptions

from datetime import timedelta
from service.models import ExtendedService
from promotion.models import Promotion

add_introspection_rules([], ["^scheduler\.models\.CustomDateTimeField"])

def datetimeIterator(from_date=None, to_date=None, delta=timedelta(minutes=30)):
    from_date = from_date or datetime.datetime.now()
    print "timeslot %s" % (delta)
    while to_date is None or from_date <= to_date:
        yield from_date
        from_date = from_date + delta
        return

def getToday():
    currentdate = datetime.datetime.today()
    currentdate = currentdate.combine(currentdate.date(), currentdate.min.time())
    return currentdate

class CustomDateTimeField(models.DateTimeField):
    
    def to_python(self, value):
        if value is None:
            return value
        if isinstance(value, datetime.datetime):
            return value
        if isinstance(value, datetime.date):
            return datetime.datetime(value.year, value.month, value.day)

        # Attempt to parse a datetime:
        value = smart_str(value)
        # split usecs, because they are not recognized by strptime.
        if '.' in value:
            try:
                value, usecs = value.split('.')
                usecs = int(usecs)
            except ValueError:
                raise exceptions.ValueError(self.error_messages['invalid'])
        else:
            usecs = 0
        kwargs = {'microsecond': usecs}
        try: # Seconds are optional, so try converting seconds first.
            return datetime.datetime(*time.strptime(value, '%Y-%m-%d %H:%M:%S')[:6],
                                     **kwargs)

        except ValueError:
            try: # Try without seconds.
                return datetime.datetime(*time.strptime(value, '%Y-%m-%d %H:%M')[:5],
                                         **kwargs)
            except ValueError: # Try without hour/minutes/seconds.
                try:
                    return datetime.datetime(*time.strptime(value, '%Y-%m-%d')[:3],
                                             **kwargs)
                except ValueError:
                    try:
                        return datetime.datetime(*time.strptime(value, '%m-%d-%Y')[:3],
                                                 **kwargs)
                    except ValueError:
                        raise exceptions.ValueError(self.error_messages['invalid'])
    

class Calendar(models.Model):
    """
    """
    title = models.CharField(u'Заголовок', max_length=300)
    class Meta:
        verbose_name = u'календарь'
        verbose_name_plural = u'календари'
        ordering = ('title',)
        
    def __unicode__(self):
        return self.title
    
class Event(models.Model):
    """
    Модель смены врача
    """
    staff = models.ForeignKey(Position, blank = True, null = True)
    cid = models.PositiveIntegerField(u'ID календаря', blank = True, null = True)
    title = models.CharField(u'Заголовок', max_length=300, blank = True, null = True)
    start = CustomDateTimeField(u'Начальная дата', blank = True, null = True)
    end = CustomDateTimeField(u'Конечная дата', blank = True, null = True)
    loc = models.TextField(u'Кабинет', blank = True, null = True)
    notes = models.TextField(u'Примечание', blank = True, null = True)
    url = models.CharField(u'Заголовок', max_length=300, blank = True, null = True)
    ad = models.BooleanField(u'Весь день', default = False)
    timeslot = models.BooleanField(u'Таймслот', default = False)
    vacant = models.BooleanField(u'Свободно', default = True)
    rem = models.CharField(u'Напоминание', max_length = 60, blank = True, null = True)
    n = models.BooleanField(u'Новое событие', default = True)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children')
    
    @transaction.commit_on_success
    def save(self, *args, **kwargs):
        if not self.timeslot and not self.id:
            staff = Position.objects.get(id=self.cid)
            timeslot = timedelta(minutes=staff.staff.doctor.get_timeslot_display() or 30)
            start = self.start
            end = self.end
            while start < end:
                print start
                Event.objects.create(staff = self.staff, cid = self.cid,title='',start = start,\
                                     end = start+timeslot, timeslot = True, vacant = True, n = False, \
                                     parent = self, rem = self.rem)
                start += timeslot
#        try:
#            st = Position.objects.get(id = self.cid)
#            self.staff = st
#        except:
#            print 'Event save Error! Position %s not found' % (self.cid)
        super(Event, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if not self.timeslot:
            timeslots = Event.objects.filter(timeslot=True,start__gte=self.start,start__lte=self.end, cid = self.cid)
            for timeslot in  timeslots:
                preorders = Preorder.objects.filter(timeslot=timeslot)
                if preorders:
                    preorders[0].delete()
                timeslot.delete()
        super(Event, self).delete(*args, **kwargs) 


    def __unicode__(self):
        return '%s-%s' % (self.staff.staff.last_name,self.start)
            
    class Meta:
        verbose_name = u'смена'
        verbose_name_plural = u'смены'
        ordering = ('cid',)
        
class Preorder(models.Model):
    """
    Модель предварительного заказа
    """
    created = models.DateTimeField(u'Создано', auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    operator = models.ForeignKey(User, related_name='operator_in_preorder', blank = True, null=True)
    patient = models.ForeignKey(Patient, blank = True, null = True)
    timeslot = models.OneToOneField(Event, blank = True, null = True, related_name='preord')
    comment = models.TextField(u'Примечание', blank = True, null = True)
    expiration = CustomDateTimeField(u'Дата истечения', blank = True, null = True)
    visit = models.ForeignKey(Visit, blank = True, null=True)
    service = models.ForeignKey(ExtendedService, blank = True, null=True)
    payment_type = models.CharField(u'Способ оплаты', max_length=1, 
                                    default=u'н', 
                                    choices=PAYMENT_TYPES)
    promotion = models.ForeignKey(Promotion,blank = True, null=True)
    count = models.PositiveIntegerField(u'Количество', default=1)
    objects = models.Manager()
    
    def get_staff_name(self):
        if self.timeslot:
            staff_name = Position.objects.get(id=self.timeslot.cid).staff.short_name()
            return staff_name
        else:
            return ''
    
    @transaction.commit_on_success
    def save(self, *args, **kwargs):
        if self.timeslot:
            self.timeslot.vacant = False
            self.timeslot.save()
        super(Preorder, self).save(*args, **kwargs) 
        
    def delete(self, *args, **kwargs):
        if self.timeslot:
            self.timeslot.vacant = True 
            self.timeslot.save()
        super(Preorder, self).delete(*args, **kwargs) 

    class Meta:
        verbose_name = u'предзаказ'
        verbose_name_plural = u'предзаказы'
        ordering = ('id',)
        
    def __unicode__(self):
        return self.patient.full_name()
    
    
### SIGNALS

#@transaction.commit_on_success
#def PreorderPreDelete(sender, **kwargs):
#    """
#    """
#    obj = kwargs['instance']
#    timeslot = obj.timeslot
#    timeslot.vacant=True
#    timeslot.save()
    #visit
    #p = visit.patient
    #p.billed_account -= obj.total_price
    #p.save()
    
#pre_delete.connect(PreorderPreDelete, sender=Preorder)