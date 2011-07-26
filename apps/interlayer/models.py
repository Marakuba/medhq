# -*- coding: utf-8 -*-
from django.db import models

class ClientItem(models.Model):
    created = models.DateTimeField(u'Дата создания', auto_now_add=True)
    
    def __unicode__(self):
        return self.id
    
    class Meta:
        verbose_name = u'клиент'
        verbose_name_plural = u'клиенты'