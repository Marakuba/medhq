# -*- coding: utf-8 -*-

"""
"""
from django.db import models

class AdSource(models.Model):
    """
    """
    
    name = models.CharField(u'Наименование', max_length=200)
    
    def __unicode__(self):
        return self.name

    class Meta:
        verbose_name = u'источник рекламы'
        verbose_name_plural = u'источники рекламы'
        ordering = ('name',)
    
    