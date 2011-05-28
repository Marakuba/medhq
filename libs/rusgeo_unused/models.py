# -*- coding: utf-8 -*-

from django.db import models

class AdrType(models.Model):
    level = models.PositiveIntegerField(u'Уровень')
    shortcut = models.CharField(u'Сокращенное наименование', max_length=10)    
    name = models.CharField(u'Наименование', max_length=29)
    
    class Meta:
        ordering = ['name']
        verbose_name = u'Тип адресного объекта'
        verbose_name_plural = u'Типы адресных объектов'
    
    def __unicode__(self):
        return u"%s" % self.name

STATUS = (
    ('0',u'объект не является центром административно-территориального образования'),
    ('1',u'объект является центром района'),
    ('2',u'объект является центром (столицей) региона'),
    ('3',u'объект является одновременно и центром района и центром региона'),
    ('4',u'центральный район, т.е. район, в котором находится центр региона (только для объектов 2-го уровня)'),
)
    
class Region(models.Model):
    name = models.CharField(u'Наименование', max_length=40)
    code = models.CharField(u'Код', max_length=2)
    adrtype = models.ForeignKey(AdrType)
    
    class Meta:
        verbose_name = u'Регион'
        verbose_name_plural = u'Регионы'
    
    def __unicode__(self):
        return u"%s - %s" % (self.name, self.code)

    
class District(models.Model):
    name = models.CharField(u'Наименование', max_length=40)
    code = models.CharField(u'Код', max_length=5)
    adrtype = models.ForeignKey(AdrType)
    status = models.CharField(u'Статус', max_length=1, choices=STATUS)
    region = models.ForeignKey(Region, null=True)
    
    class Meta:
        verbose_name = u'Район'
        verbose_name_plural = u'Районы'
    
    def __unicode__(self):
        return u"%s" % self.name

    
class City(models.Model):
    name = models.CharField(u'Наименование', max_length=40)
    code = models.CharField(u'Код', max_length=3)
    adrtype = models.ForeignKey(AdrType)
    region = models.ForeignKey(Region)
    district = models.ForeignKey(District, null=True, blank=True)
    major_city = models.ForeignKey('self', null=True, blank=True)
    status = models.CharField(u'Статус', max_length=1, choices=STATUS)
    
    class Meta:
        verbose_name = u'Город (населенный пункт)'
        verbose_name_plural = u'Города (населенные пункты)'
    
    def full_address(self):
        address = []
        address.append(u"%s %s" % (self.region.name, self.region.adrtype))
        if self.district:
            address.append(u"%s %s" % (self.district.name, self.district.adrtype))
        address.append(u"%s %s" % (self.adrtype, self.name))
        
        return ", ".join(address)
    
    def __unicode__(self):
        return u"%s %s" % (self.adrtype.shortcut, self.name)
