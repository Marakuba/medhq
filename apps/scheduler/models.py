# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User
import datetime

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
    """
    cid = models.PositiveIntegerField(u'ID календаря', blank = True, null = True)
    title = models.CharField(u'Заголовок', max_length=300)
    start = models.DateTimeField(u'Начальная дата', blank = True, null = True)
    end = models.DateTimeField(u'Конечная дата', blank = True, null = True)
    loc = models.TextField(u'Локация', blank = True, null = True)
    notes = models.TextField(u'Примечание', blank = True, null = True)
    url = models.CharField(u'Заголовок', max_length=300)
    ad = models.BooleanField(u'Весь день', default = False)
    rem = models.CharField(u'Напоминание', max_length = 60)
    n = models.BooleanField(u'Новое событие', default = True)
    
    class Meta:
        verbose_name = u'событие'
        verbose_name_plural = u'события'
        ordering = ('cid',)
        
    def __unicode__(self):
        return self.title
    