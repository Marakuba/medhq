# -*- coding: utf-8 -*-
from django.db import models, transaction
from django.db.models import Min,Max
from django.utils.encoding import smart_unicode
from django.db.models.signals import post_save
from core.models import make_operator_object
from state.models import State
import datetime
from dateutil import rrule
from core.decorators import require_lock
from django.db.models.expressions import F
from django.core.exceptions import ObjectDoesNotExist


class BarcodePackage(make_operator_object('barcodepackage')):
    """
    """
    print_date = models.DateTimeField(u'Дата печати', blank=True, null=True)
    laboratory = models.ForeignKey(State) ## limit choices
    x2 = models.IntegerField(default=0)
    x3 = models.IntegerField(default=0)
    x4 = models.IntegerField(default=0)
    x5 = models.IntegerField(default=0)
    x6 = models.IntegerField(default=0)
    x7 = models.IntegerField(default=0)
    x8 = models.IntegerField(default=0)
    
    objects = models.Manager()
    
    class Meta:
        verbose_name = u'пакет штрих-кодов'
        verbose_name_plural = u'пакеты штрих-кодов'
        ordering = ('-created',)
    
    def range(self):
        """
        """
        m = Barcode.objects.filter(package=self).aggregate(Min('id'),Max('id'))
        return (m['id__min'],m['id__max'])
    

BARCODE_STATUS = [(i,item) for i,item in enumerate((u'Зарезервирован',u'Использован'))]

class Barcode(models.Model):
    """
    """
    status = models.IntegerField(u'Статус',
                                 default=1, 
                                 choices=BARCODE_STATUS)
    package = models.ForeignKey(BarcodePackage, null=True, blank=True)
    duplicates = models.IntegerField(u'Дубликаты', default=1)
    
    class Meta:
        verbose_name = u'штрих-код'
        verbose_name_plural = u'штрих-коды'
        ordering = ('-id',)
    
    def __unicode__(self):
        return smart_unicode(u"штрих-код %s" % self.id)
    

RESET_ON = [(rrule.MONTHLY,u'Ежемесячно')]
    
class Numerator(models.Model):
    """
    """
    name = models.CharField(u'Наименование', max_length=50)
    tag = models.CharField(u'Тэг', max_length=20)
    reset_on = models.IntegerField(u'Когда производится сброс', default=0, choices=RESET_ON)
    current = models.IntegerField(u'Текущее значение', default=0)
    valid_till = models.DateTimeField(u'Дата сброса', default=datetime.datetime.now())
    min_value = models.IntegerField(u'Минимальное значение', default=0)
    max_value = models.IntegerField(u'Максимальное значение', default=999) # надо подумать как обрабатывать превышение показания счетчика
    prefix = models.CharField(u'Префикс', max_length=10, blank=True)
    
    class Meta:
        verbose_name = u'нумератор'
        verbose_name_plural = u'нумераторы'
        ordering = ('name',)
    
    def __unicode__(self):
        return smart_unicode(u"%s" % self.name)
    
    def get_next_valid_date(self, dtstart):
        #TODO: в дальнейшем убрать жесткую привязку к месячному периоду
        return list(rrule.rrule(rrule.MONTHLY, 
                                count=1, 
                                dtstart=dtstart, 
                                bymonthday=1, 
                                byhour=0, byminute=0, bysecond=0))[0]    

    def is_date_valid(self):
        NOW = datetime.datetime.now()
        if self.valid_till<NOW:
            return {
                'current' : 0,
                'valid_till' : self.get_next_valid_date(NOW)
            }
        return {}
    

class NumeratorItem(models.Model):
    """
    """
    numerator = models.ForeignKey(Numerator)
    number = models.IntegerField(u'Номер', default=0)
    
    class Meta:
        verbose_name = u'элемент нумератора'
        verbose_name_plural = u'элементы нумераторов'
        ordering = ('-id',)

    def __unicode__(self):
        return smart_unicode(u"%s" % self.id)


@transaction.commit_on_success
def generate_numerator(tag='euromed'):
    """
    """
    try:
        nm = Numerator.objects.get(tag=tag)
        values = {}
        values.update(**nm.is_date_valid())
        Numerator.objects.filter(tag=tag).update(current=F('current')+1, **values)
        new_numerator = NumeratorItem.objects.create(numerator=nm, number=nm.current) 
        return new_numerator
    except ObjectDoesNotExist:
        raise "Numerator 'euromed' not found!"
    

@transaction.commit_manually
def GeneratePackage(sender, **kwargs):
    """
    """
    if kwargs['created']:
        obj = kwargs['instance']
        for x in range(2,9):
            count = getattr(obj,"x%s" % x, 0)
            if count:
                for i in range(count):
                    bc = Barcode.objects.create(status=0,
                                           package=obj,
                                           duplicates=x)
                    bc.save()
        transaction.commit()

post_save.connect(GeneratePackage, sender=BarcodePackage)