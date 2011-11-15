# -*- coding: utf-8 -*-

"""
"""

from django.db import models
from state.models import State
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic
from django.utils.encoding import smart_unicode


class SyncObject(models.Model):
    """
    """
    created = models.DateTimeField(u'Создано', auto_now_add=True)
    content_type = models.ForeignKey(ContentType)
    object_id = models.IntegerField()
    content_object = generic.GenericForeignKey('content_type', 'object_id')
    sync_id = models.IntegerField()
    state = models.ForeignKey(State)
    
    class Meta:
        verbose_name = u'объект синхронизации'
        verbose_name_plural = u'объекты синхронизации'
        ordering = ('-created',)

    def __unicode__(self):
        return smart_unicode("<<SyncObject>>")
    
    
class RemoteState(models.Model):
    """
    """
    created = models.DateTimeField(u'Создано', auto_now_add=True)
    modified = models.DateTimeField(u'Изменено', auto_now=True)
    state = models.ForeignKey(State)
    secret_key = models.CharField(u'Секретный код', max_length=256)
    domain_url = models.URLField(u'URL', verify_exists=False)
    
    class Meta:
        verbose_name = u'внешняя лаборатория'
        verbose_name_plural = u'внешние лаборатории'
        ordering = ('-created',)

    def __unicode__(self):
        return smart_unicode("<<RemoteLab>>")
    

TRANSACTION_TYPES = (
    (u'state.out',u'Выгрузка данных для лаборатории'),
    (u'state.in',u'Получение результатов анализов'),
    (u'lab.in',u'Получение данных для лаборатории'),
    (u'lab.out',u'Передача результатов анализов'),
)

class Transaction(models.Model):
    """
    """
    created = models.DateTimeField(u'Создано', auto_now_add=True)
    type = models.CharField(u'Тип', max_length=20, choices=TRANSACTION_TYPES)
    sender = models.ForeignKey(State, related_name='sender_state')
    reciever = models.ForeignKey(State, related_name='reciever_state')
    

TRANSACTION_STATUSES = (
    (u'network.error',u'Ошибка связи'),
    (u'result.progress',u'Получение результатов анализов'),
    (u'result.complete',u'Получение данных для лаборатории'),
)

class TransactionItem(models.Model):
    """
    """
    transaction = models.ForeignKey(Transaction)
    status = models.CharField(u'Статус', max_length=20)
    content_type = models.ForeignKey(ContentType)
    object_id = models.IntegerField()
    content_object = generic.GenericForeignKey('content_type', 'object_id')