# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from interlayer.models import ClientItem
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic
from django.db.models import Sum
from state.models import State

PAYMENT_TYPES = (
    (u'cash',u'Наличные'),
    (u'non_cash',u'Безналичный расчет'),
    (u'card',u'Банковская карта')
)

PAYMENT_DIRECTION = (
    (u'1',u'Приходный'),
    (u'2',u'Расходный')
)

class Account(models.Model):
    created = models.DateTimeField(u'Дата создания', auto_now_add=True)
    amount = models.FloatField(u'Сумма',default=0)
    modified = models.DateTimeField(u'Дата изменения', auto_now=True)
        
    def setSum(self):
        sum = Payment.objects.filter(client_account__account = self).aggregate(Sum("amount"))
        self.amount = sum['amount__sum']
        self.save()
        
    def __unicode__(self):
        return "%s" % (self.id)
    
    class Meta:
        verbose_name = u'счет'
        verbose_name_plural = u'счета'
        
class ClientAccount(models.Model):
    client_item = models.ForeignKey(ClientItem)
    account = models.ForeignKey(Account, verbose_name=Account._meta.verbose_name)
    
    def __unicode__(self):
        return "%s" % (self.id)
    
class Payment(models.Model):
    operator = models.ForeignKey(User)
    created = models.DateTimeField(u'Дата создания', auto_now_add=True)
    office = models.ForeignKey(State, blank=True, null=True,
                               limit_choices_to={'type__in':['b','p']}, 
                               verbose_name=u'Офис')
    doc_date = models.DateTimeField(u'Дата документа')
    client_account = models.ForeignKey(ClientAccount, verbose_name=u'Лицевой счет')
    amount = models.FloatField(u'Сумма')
    income = models.BooleanField(u'Поступление')
    direction = models.CharField(u'Тип', max_length=1, choices=PAYMENT_DIRECTION)
    payment_type = models.CharField(u'Способ оплаты', max_length=10, choices=PAYMENT_TYPES, blank=True, null=True)
    content_type = models.ForeignKey(ContentType, blank=True, null=True)
    object_id = models.PositiveIntegerField(blank=True, null=True)
    document = generic.GenericForeignKey('content_type', 'object_id')
    comment = models.TextField(u'Комментарий', blank=True, null=True)
    print_check = models.BooleanField(u'Чек напечатан', default=False)
    
    def save(self, *args, **kwargs):
        if self.direction == '2':
            self.amount = -(abs(self.amount))   
        super(Payment, self).save(*args, **kwargs)
        self.client_account.account.setSum()
        self.client_account.client_item.client.updBalance()
        
    def get_client(self):
        return self.client_account.client_item.client.short_name()
    get_client.short_description = u'Клиент'
       
    def __unicode__(self):
        return u"№%s, %s" % (self.id, self.client_account.client_item.client.short_name())
    
    class Meta:
        verbose_name = u'кассовый ордер'
        verbose_name_plural = u'кассовые ордеры'
        ordering = ('-doc_date',)

    