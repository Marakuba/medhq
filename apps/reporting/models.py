# -*- coding: utf-8 -*-
from django.db import models
from service.models import BaseService
from state.models import State

GROUP_SERVICE_UZI = 'uzi'

GROUP_SERVICE = (
    (u'%s' % GROUP_SERVICE_UZI,u'УЗИ'),
)

class ServiceGroup(models.Model):
    name = models.CharField(u'Наименование', max_length=3
            , choices = GROUP_SERVICE,unique=True)
    baseservice = models.ManyToManyField(BaseService, related_name = 'srvicegroup'
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

