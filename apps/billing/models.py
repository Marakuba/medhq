# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from interlayer.models import ClientItem
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic
from django.db.models import Sum

PAYMENT_TYPES = (
    (u'cash',u'Наличные'),
    (u'non_cash',u'Безналичный расчет'),
    (u'card',u'Банковская карта')
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
    doc_date = models.DateTimeField(u'Дата документа')
    client_account = models.ForeignKey(ClientAccount)
    amount = models.FloatField(u'Сумма')
    income = models.BooleanField(u'Приход')
    payment_type = models.CharField(u'Вид оплаты', max_length=10, choices=PAYMENT_TYPES, blank=True, null=True)
    content_type = models.ForeignKey(ContentType, blank=True, null=True)
    object_id = models.PositiveIntegerField(blank=True, null=True)
    document = generic.GenericForeignKey('content_type', 'object_id')
    comment = models.TextField(u'Комментарий', blank=True, null=True)
    
    def save(self, *args, **kwargs):
        if self.income == 'false':
            self.amount = -(abs(self.amount))   
            self.income = False
            print self.amount  
        super(Payment, self).save(*args, **kwargs)
        #print self.income
        self.client_account.account.setSum()
        self.client_account.client_item.client.updBalance()
       
    def __unicode__(self):
        return "%s" % (self.id)
    
    class Meta:
        verbose_name = u'Платежка'
        verbose_name_plural = u'Платежки'
        ordering = ('-id',)

    