# -*- coding: utf-8 -*-

from django.db import models
from service.models import ICD10
from medhq.apps.service.models import ExtendedService

class AgeCategory(models.Model):
    
    name = models.CharField(u'Наименование', max_length=200)
    age_from = models.PositiveIntegerField(u'Возраст от', default = 0)
    age_to = models.PositiveIntegerField(u'Возраст до', default = 250)
    
    def __unicode__(self):
        return u"%s" % ( self.name)
        
    class Meta:
        verbose_name = u"Возрастная категория"
        verbose_name_plural = u"возрастные категории"
        ordering = ('name',)
        
class NosologicalForm(models.Model):
    
    name = models.CharField(u'Наименование', max_length=200)
    
    def __unicode__(self):
        return u"%s" % ( self.name)
        
    class Meta:
        verbose_name = u"Носологическая форма"
        verbose_name_plural = u"носологические формы"
        ordering = ('name',)
        
class Phase(models.Model):
    
    name = models.CharField(u'Наименование', max_length=200)
    
    def __unicode__(self):
        return u"%s" % ( self.name)
        
    class Meta:
        verbose_name = u"Фаза"
        verbose_name_plural = u"фазы"
        ordering = ('name',)
        
class Stage(models.Model):
    
    name = models.CharField(u'Наименование', max_length=200)
    
    def __unicode__(self):
        return u"%s" % ( self.name)
        
    class Meta:
        verbose_name = u"Этап"
        verbose_name_plural = u"этапы"
        ordering = ('name',)
        
class Complications(models.Model):
    
    name = models.CharField(u'Наименование', max_length=200)
    
    def __unicode__(self):
        return u"%s" % ( self.name)
        
    class Meta:
        verbose_name = u"Осложнения"
        verbose_name_plural = u"осложнения"
        ordering = ('name',)
        
class Term(models.Model):
    
    name = models.CharField(u'Наименование', max_length=200)
    
    def __unicode__(self):
        return u"%s" % ( self.name)
        
    class Meta:
        verbose_name = u"Условие оказания"
        verbose_name_plural = u"условия оказания"
        ordering = ('name',)


class Standart(models.Model):
    
    name = models.CharField(u'Наименование', max_length=200)
    age_category = models.ManyToManyField(AgeCategory, 
                                 null=True, blank=True, related_name='age_category')
    nosological_form = models.ForeignKey(NosologicalForm, 
                                 null=True, blank=True)
    phase = models.ForeignKey(Phase, 
                                 null=True, blank=True)
    stage = models.ForeignKey(Stage, 
                                 null=True, blank=True)
    complications = models.ForeignKey(Complications, 
                                 null=True, blank=True)
    terms = models.ManyToManyField(Term, related_name='terms',
                                 null=True, blank=True)
    mkb10 = models.ForeignKey(ICD10, 
                                 null=True, blank=True)
    
    def get_items_str(self,field):
        items = getattr(self,field).get_query_set()
        i_names = [i.name for i in items]
        return ', '.join(i_names)
    
    def __unicode__(self):
        return u"%s" % ( self.name)
        
    class Meta:
        verbose_name = u"Медицинский стандарт"
        verbose_name_plural = u"Медицинские стандарты"
        ordering = ('name',)
        
class StandartItem(models.Model):
    standart = models.ForeignKey(Standart)
    service = models.ForeignKey(ExtendedService)
    frequency = models.DecimalField(u'Частота предоставления',max_digits=7, decimal_places=4,default = 1)
    average = models.DecimalField(u'Среднее количество',max_digits=7, decimal_places=4,default = 1)
    
    def __unicode__(self):
        return u"%s" % ( self.standart.name)
        
    class Meta:
        verbose_name = u"Элемент стандартов"
        verbose_name_plural = u"элементы стандартов"
        ordering = ('standart',)