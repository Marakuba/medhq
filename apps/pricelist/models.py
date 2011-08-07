# -*- coding: utf-8 -*-

from django.db import models

from state.models import State
from service.models import BaseService, ExtendedService
from django.utils.encoding import smart_unicode
import datetime


class PriceType(models.Model):
    name = models.CharField(u'Наименование', max_length=50)
    slug = models.SlugField(u'SKU', default=u'')
    
    def __unicode__(self):
        return u"%s" % self.name
    
    class Meta:
        verbose_name = u"тип цены"
        verbose_name_plural = u"типы цены"

PRICE_TYPES = (
    (u'r',u'Розничная'),
    (u'z',u'Закупочная'),
)
            
class Price(models.Model):
    service = models.ForeignKey(BaseService, blank=True, null=True)
    extended_service = models.ForeignKey(ExtendedService, blank=True, null=True) 
    type = models.ForeignKey(PriceType, verbose_name=u'Тип цены', blank=True, null=True)
    price_type = models.CharField(u'Тип цены!', max_length=1, choices=PRICE_TYPES)
    value = models.DecimalField(u'Сумма, руб.', max_digits=10, decimal_places=2,
                                null=True)
    on_date = models.DateField(u'Начало действия', default=datetime.date.today())

    def __unicode__(self):
        return smart_unicode(u"%s - %s" % (self.extended_service.state, self.get_price_type_display()))
    
    class Meta:
        verbose_name = u"цена"
        verbose_name_plural = u"цены"
        get_latest_by = "on_date"
            
            
DISCOUNT_TYPES =(
    (u'accum',u'Накопительная'),
    (u'gen',u'Общая'),
    (u'pens',u'Пенсионная'),
    (u'admin',u'Административная'),
    (u'arc',u'Архив'),
)

class Discount(models.Model):
    """
    """
    type = models.CharField(u'Тип', max_length=5, default=u'gen', choices=DISCOUNT_TYPES)
    name = models.CharField(u'Наименование', max_length=30)
    value = models.DecimalField(u"Размер, %.", max_digits=5, decimal_places=2)
    min = models.DecimalField(u'Сумма от', max_digits=10, decimal_places=2, default=0.0)
    max = models.DecimalField(u'Сумма до', max_digits=10, decimal_places=2, default=0.0)
    comment = models.TextField(u"Комментарий", blank=True)
    
    def __unicode__(self):
        return u"%s %s" % (self.name, self.value)
    
    class Meta:
        verbose_name = u'скидка'
        verbose_name_plural = u'скидки'
        ordering = ('id',)
    
