# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes import generic
from django.contrib.contenttypes.models import ContentType

from core.models import make_operator_object
from taskmanager.settings import TASK_STATUSES


class TaskType(models.Model):
    """
    """
    
    name = models.CharField(u'Наименование', max_length=50)
    
    def __unicode__(self):
        return "%s" % self.name
    
    class Meta:
        verbose_name = u"тип задачи"
        verbose_name_plural = u"типы задач"


class Task(make_operator_object('task')):
    """
    """
    
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children', verbose_name='Родительская задача')
    start = models.DateTimeField(u'Начало выполнения')
    end = models.DateTimeField(u'Окончание выполнения')
    completed = models.DateTimeField(u'Выполнено')
    watcher = models.ForeignKey(User, null=True, related_name='watcher', verbose_name=u'Контроллер')
    type = models.ForeignKey(TaskType, verbose_name=u'Тип задачи')
    content_type = models.ForeignKey(ContentType, 
                                     limit_choices_to = {'model__in':('staff','department')},
                                     verbose_name=u'Получатель')  
    object_id = models.PositiveIntegerField()
    assigned_to = generic.GenericForeignKey('content_type', 'object_id')
    status = models.CharField(u'Статус', max_length=1, choices=TASK_STATUSES)
    
    def __unicode__(self):
        return "%s" % self.type
    
    class Meta:
        verbose_name = u"задача"
        verbose_name_plural = u"задачи"

