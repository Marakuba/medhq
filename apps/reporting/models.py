# -*- coding: utf-8 -*-
from django.db import models
from service.models import BaseService
from state.models import State
from django.conf import settings
from constance import config
from django.contrib.auth.models import Group
from mptt.models import MPTTModel

#GROUP_SERVICE_UZI = 'uzi'
#GROUP_SERVICE_LAB = 'lab'

#GROUP_SERVICE = (
#    (u'%s' % GROUP_SERVICE_UZI,u'УЗИ'),
#    (u'%s' % GROUP_SERVICE_LAB,u'Лабораторка'),
#)

try:
    GROUP_SERVICE = settings.GROUP_SERVICE
except:
    raise u"Нет настроек групп услуг"

class ServiceGroupPrice_BaseService(models.Model):
    baseservice = models.ForeignKey(BaseService,unique=True)
    servicegroupprice = models.ForeignKey('ServiceGroupPrice')

    class Meta:
        verbose_name = u'услуга'
        verbose_name_plural = u'услуги'    

class ServiceGroupPrice(models.Model):
    name =  models.CharField(u'Наименование', max_length=64, unique=True)
    baseservice = models.ManyToManyField(BaseService, related_name = 'servicegroupprice'
            , verbose_name = u'Услуги',through='ServiceGroupPrice_BaseService')

    class Meta:
        verbose_name = u'группы услуг по прайсу'
        verbose_name_plural = u'группа услуг оп прайсу'

    def __unicode__(self):
        return u'%s'  %(self.name)

class ServiceGroup(models.Model):
    name = models.CharField(u'Наименование', max_length=3
            , choices = GROUP_SERVICE,unique=True)
    baseservice = models.ManyToManyField(BaseService, related_name = 'servicegroup'
            , verbose_name = u'Услуги')

    class Meta:
        verbose_name = u'группы услуг'
        verbose_name_plural = u'группа услуг'

    def __unicode__(self):
        return u'%s'  %(dict(GROUP_SERVICE).get(self.name))

class StateGroup_State(models.Model):
    state = models.ForeignKey(State,unique=True)
    stategroup = models.ForeignKey('StateGroup')

    class Meta:
        verbose_name = u'филиал'
        verbose_name_plural = u'филиалы'    

class StateGroup(models.Model):
    name =  models.CharField(u'Наименование', max_length=64, unique=True)
    state = models.ManyToManyField(State, related_name = 'stategroup'
            , verbose_name = u'Лаборатории', through='StateGroup_State')

    class Meta:
        verbose_name = u'группы лабораторий'
        verbose_name_plural = u'группа лабораторий'

    def __unicode__(self):
        return u'%s'  %(self.name)


class Query(models.Model):
    sql = models.TextField(u'SQL-запрос')
    name = models.CharField(u'Название', max_length=300)
    
    class Meta:
        verbose_name = u'sql-запрос'
        verbose_name_plural = u'sql-запросы'
        
    def __unicode__(self):
        return u'%s'  %(self.name)

class Report(MPTTModel):
    """
    """
    parent = models.ForeignKey('self', null=True, blank=True, verbose_name=u'Родительский элемент', related_name='children')
    name = models.CharField(u'Название', max_length=300)
    slug = models.CharField(u'Модуль', max_length=100, blank = True) 
    template = models.CharField(u'Шаблон', max_length=100, blank = True) 
    sql_query = models.ForeignKey(Query, null = True, blank = True)
    is_active = models.BooleanField(u'Активен', default=True)
    formclass = models.CharField(u'Форма', max_length=100, null = True, blank = True) 
    
    class Meta:
        verbose_name = u'отчет'
        verbose_name_plural = u'отчеты'
        
    def get_sql(self):
        if self.sql_query:
            return self.sql_query.sql
        
    def get_form(self):
        formclass = self.formclass or config.BASE_REPORT_FORM
        if not formclass:
            return False
        path = formclass.split('.')
        cls = path[-1]
        app = ".".join(path[:-1])
        fromlist = path[-2]
        form_module = __import__(app,{},{},fromlist,-1)
        form = getattr(form_module,cls)
        return form
        
    def get_fields(self):
        formclass = self.get_form()
        if formclass:
            form = formclass()
            fields = form.fields.keys()
            return fields
        else:
            return []
        
    def __unicode__(self):
        return u'%s'  %(self.name)
