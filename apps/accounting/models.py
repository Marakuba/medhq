# -*- coding: utf-8 -*-

from django.db import models
from django.db.models.signals import post_save
from django.db.models.aggregates import Sum

from core.models import make_operator_object
from patient.models import Patient
from scheduler.models import Preorder
from service.models import BaseService, ExtendedService
from state.models import State
from django.utils.encoding import smart_unicode


class Contract(make_operator_object('acc_contract')):

    number = models.CharField(u'Номер', max_length=20)
    on_date = models.DateField(u'Дата')
    branch = models.ForeignKey(State, related_name='contract_branch', limit_choices_to={'type': 'b'})
    state = models.ForeignKey(State, related_name='contract_state', limit_choices_to={'type': 'j'})
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = u'договор'
        verbose_name_plural = 'договоры'
        ordering = ('-id',)

    def __unicode__(self):
        return u"№%s от %s" % (self.number, self.on_date.strftime('%d.%m.%Y'))


class Invoice(make_operator_object('acc_invoice')):

    contract = models.ForeignKey(Contract)
    number = models.CharField(u'Номер', max_length=20)
    on_date = models.DateField(u'Дата')
    total_price = models.DecimalField(u'Сумма', max_digits=10, decimal_places=2, default=0.0)
    modified = models.DateTimeField(auto_now=True)

    def update_total_price(self):
        result = self.invoiceitem_set.all().aggregate(sum=Sum('total_price'))
        self.total_price = result['sum'] or 0
        self.save()

    class Meta:
        verbose_name = u'счет'
        verbose_name_plural = u'счета'
        ordering = ('-id',)

    def __unicode__(self):
        return u"№%s от %s" % (self.number, self.on_date.strftime('%d.%m.%Y'))


class InvoiceItem(make_operator_object('acc_invoice_item')):

    invoice = models.ForeignKey(Invoice)
    patient = models.ForeignKey(Patient)
    service = models.ForeignKey(BaseService)
    execution_place = models.ForeignKey(State)
    price = models.DecimalField(u'Цена', max_digits=10, decimal_places=2, default=0.0)
    count = models.IntegerField(u'Количество', default=1)
    total_price = models.DecimalField(u'Сумма', max_digits=10, decimal_places=2, default=0.0)
    preorder = models.OneToOneField(Preorder, null=True, blank=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = u'позиция счета'
        verbose_name_plural = u'позиции счетов'
        ordering = ('-id',)

    def __unicode__(self):
        return smart_unicode(u"<<%s>>" % self.id)


def update_total_price(sender, **kwargs):
    item = kwargs['instance']
    item.invoice.update_total_price()


def update_preorder(sender, **kwargs):
    item = kwargs['instance']
    if not item.preorder:
        try:
            extended_service = ExtendedService.objects.get(base_service=item.service, state=item.execution_place)
            preorder = Preorder.objects.create(patient=item.patient, service=extended_service, \
                payment_type=u'б', price=item.total_price)
            item.preorder = preorder
            item.save()
        except:
            pass
    else:
        item.preorder.price = item.total_price
        item.preorder.save()

post_save.connect(update_total_price, sender=InvoiceItem)
post_save.connect(update_preorder, sender=InvoiceItem)
