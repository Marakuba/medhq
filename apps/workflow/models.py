# -*- coding: utf-8 -*-

from django.db import models


TYPES = (
    (u'new',u'новый'),
    (u'canceled',u'отменен'),
    (u'progress',u'в работе'),
    (u'done',u'выполнен')
)

class Status(models.Model):
    """
    """
    title = models.CharField(u'Заголовок', max_length=50)
    type = models.CharField(u'Тип', max_length=10, choices=TYPES)
    
    def __unicode__(self):
        return self.title
    
    class Meta:
        verbose_name = u'статус'
        verbose_name_plural = u'статусы'
        
        