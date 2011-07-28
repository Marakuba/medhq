# -*- coding: utf-8 -*-

"""
"""

from django.db import models
from pricelist.models import Discount
from django.utils.encoding import smart_unicode
from service.models import BaseService, clear_service_cache
from state.models import State
import datetime
from django.db.models.signals import post_save, post_delete

class PromotionManager(models.Manager):
    """
    """
    
    def actual(self):
        TODAY = datetime.date.today()
        return self.filter(start_date__lte=TODAY, end_date__gte=TODAY)

class Promotion(models.Model):
    """
    """
    name = models.CharField(u'Наименование', max_length=100)
    start_date = models.DateField(u'Начало')
    end_date = models.DateField(u'Окончание')
    discount = models.ForeignKey(Discount, verbose_name=u'Скидка по акции', blank=True, null=True)
    comment = models.TextField(u'Комментарий', blank=True, help_text=u'Условия акции')
    
    objects = PromotionManager()
    
    def __unicode__(self):
        return smart_unicode(self.name)
    
    class Meta:
        verbose_name = u'акция'
        verbose_name_plural = u'акции'
        ordering = ('start_date',)
        
        
class PromotionItem(models.Model):
    """
    """
    promotion = models.ForeignKey(Promotion)
    base_service = models.ForeignKey(BaseService, verbose_name=u'Услуга')
    execution_place = models.ForeignKey(State, limit_choices_to={'type__in':('b','m')}, verbose_name=u'Место выполнения')        
    count = models.PositiveIntegerField(u'Количество', default=1)
    
    def __unicode__(self):
        return smart_unicode(self.base_service)
    
    class Meta:
        verbose_name = u'услуга акции'
        verbose_name_plural = u'услуги акции'
        
        
post_save.connect(clear_service_cache, sender=Promotion)
post_save.connect(clear_service_cache, sender=PromotionItem)
post_delete.connect(clear_service_cache, sender=Promotion)
