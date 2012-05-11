# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.contenttypes import generic
from django.contrib.contenttypes.models import ContentType

from core.models import make_operator_object
from taskmanager.settings import DELAYED_TASK_TYPES,\
    DELAYED_TASK_STATUSES


class DelayedTask(make_operator_object('delayed_task')):
    """
    """
    id_task = models.CharField(u'ID задачи', max_length=36, blank=True)
    attempts = models.PositiveIntegerField(u'Количество попыток', default=0)
    next_attempt = models.DateTimeField(u'Следующая попытка', null=True, blank=True)
    completed = models.DateTimeField(u'Выполнено', null=True, blank=True)
    type = models.CharField(u'Тип', max_length=10, choices=DELAYED_TASK_TYPES)
    content_type = models.ForeignKey(ContentType, 
                                     verbose_name=u'Объект')  
    object_id = models.PositiveIntegerField()
    assigned_to = generic.GenericForeignKey('content_type', 'object_id')
    status = models.CharField(u'Статус', max_length=10, choices=DELAYED_TASK_STATUSES)
    
    objects = models.Manager()
    
    def __unicode__(self):
        return "<<DELAYED TASK %s>>" % self.id
    
    class Meta:
        verbose_name = u"delayed task"
        verbose_name_plural = u"delayed tasks"