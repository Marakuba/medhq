# -*- coding: utf-8 -*-

from django.db import models

from core.models import make_operator_object
from patient.models import Patient
from scheduler.models import Preorder
from service.models import BaseService
from state.models import State


class Contract(make_operator_object('acc_contract')):

    number = models.CharField(u'Номер', max_length=20)
    on_date = models.DateField(u'Дата')
    branch = models.ForeignKey(State, related_name='contract_branch', limit_choices_to={'type': 'b'})
    state = models.ForeignKey(State, related_name='contract_state', limit_choices_to={'type': 'j'})
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = u'договор'
        verbose_name_plural = 'договоры'

    def __unicode__(self):
        return u"№%s от %s" % (self.number, self.on_date.strftime('%d.%m.%Y'))


class Invoice(make_operator_object('acc_invoice')):

    contract = models.ForeignKey(Contract)
    number = models.CharField(u'Номер', max_length=20)
    on_date = models.DateField(u'Дата')
    total_price = models.DecimalField(u'Сумма', max_digits=10, decimal_places=2)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = u'счет'
        verbose_name_plural = u'счета'

    def __unicode__(self):
        pass


class InvoiceItem(make_operator_object('acc_invoice_item')):

    invoice = models.ForeignKey(Invoice)
    patient = models.ForeignKey(Patient)
    service = models.ForeignKey(BaseService)
    execution_place = models.ForeignKey(State)
    price = models.DecimalField(u'Цена', max_digits=10, decimal_places=2)
    count = models.IntegerField(u'Количество')
    total_price = models.DecimalField(u'Сумма', max_digits=10, decimal_places=2)
    preorder = models.OneToOneField(Preorder)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = u'позиция счета'
        verbose_name_plural = u'позиции счетов'

    def __unicode__(self):
        pass
