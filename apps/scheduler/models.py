# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User
import datetime
from south.modelsinspector import add_introspection_rules
from django.utils.encoding import smart_unicode, force_unicode, smart_str
import time

add_introspection_rules([], ["^scheduler\.models\.CustomDateTimeField"])

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
                raise exceptions.ValidationError(self.error_messages['invalid'])
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
                        raise exceptions.ValidationError(self.error_messages['invalid'])
    

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
    start = CustomDateTimeField(u'Начальная дата', blank = True, null = True)
    end = CustomDateTimeField(u'Конечная дата', blank = True, null = True)
    loc = models.TextField(u'Локация', blank = True, null = True)
    notes = models.TextField(u'Примечание', blank = True, null = True)
    url = models.CharField(u'Заголовок', max_length=300, blank = True, null = True)
    ad = models.BooleanField(u'Весь день', default = False)
    rem = models.CharField(u'Напоминание', max_length = 60, blank = True, null = True)
    n = models.BooleanField(u'Новое событие', default = True)
    
    class Meta:
        verbose_name = u'событие'
        verbose_name_plural = u'события'
        ordering = ('cid',)
        
    def __unicode__(self):
        return self.title
    