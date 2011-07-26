# -*- coding: utf-8 -*-

import datetime
from django.db import models, transaction

from patient.models import Patient, InsurancePolicy
from service.models import BaseService
from staff.models import Position
from core.models import make_operator_object
from settings import PAYMENT_TYPES, VISIT_STATUSES, ORDER_STATUSES, PAYMENT_STATUSES
from state.models import State
from core.fields import SeparatedValuesField
from lab.vars import TEST_FORM
from django.conf import settings
from django.utils import simplejson
from pricelist.models import Discount
from django.db.models.aggregates import Sum
from numeration.models import Barcode  #, generate_numerator
from django.db.models.signals import post_save, post_delete
from lab.models import Sampling, LabOrder, Result
import logging
from django.utils.encoding import smart_unicode
from visit.settings import CANCEL_STATUSES
from django.core.exceptions import ObjectDoesNotExist

logger = logging.getLogger()
hdlr = logging.FileHandler(settings.LOG_FILE)
formatter = logging.Formatter('[%(asctime)s]%(levelname)-8s"%(message)s"','%Y-%m-%d %a %H:%M:%S') 

hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.NOTSET)




class Referral(make_operator_object('referral')):
    """
    """
    name = models.CharField(u'Ф.И.О. врача и наименование организации', 
                            max_length=200, 
                            help_text=u'Образец заполнения: Иванова И.И., гор.больница №1.')
    
    objects = models.Manager()
    
    def __unicode__(self):
        return u"%s" % (self.name,)
    
    class Meta:
        verbose_name = u'врач, организация'
        verbose_name_plural = u'врачи, организация'
        ordering = ('name',)
        

CLS = (
    (u'п',u'Посещение'),
    (u'б',u'Прием биоматериала'),
    (u'н',u'Внутреннее направление'),
    (u'з',u'Предварительная запись'),
    (u'в',u'Возврат')
)

OPERATIONS = {
    u'п':1,
    u'б':1,
    u'н':1,
    u'з':1,
    u'в':-1
}

class Visit(make_operator_object('visit')):
    """
    """
    modified = models.DateTimeField(auto_now=True)
    cls = models.CharField(u'Класс', max_length=1, choices=CLS, default=u'п')   
    office = models.ForeignKey(State, verbose_name=u'Офис', limit_choices_to={'type':u'b'}) 
    patient = models.ForeignKey(Patient, verbose_name=u'Пациент')
    on_date = models.DateTimeField(u'На дату', 
                                   null=True, blank=True)
    referral = models.ForeignKey(Referral, 
                                 verbose_name=Referral._meta.verbose_name, 
                                 null=True, blank=True,
                                 help_text=u'Указать кто направил')
    pregnancy_week = models.PositiveIntegerField(u'Беременность', 
                                                 null=True, blank=True, 
                                                 help_text=u'Указывать в неделях')
    menses_day = models.PositiveIntegerField(u'День цикла', null=True, blank=True)
    menopause = models.BooleanField(u'Менопауза', default=False)
    diagnosis = models.TextField(u'Диагноз', null=True, blank=True)
    sampled = models.DateTimeField(u'Дата и время взятия пробы', null=True, blank=True)
    status = models.CharField(u'Статус', max_length=1, 
                              default=u'т',
                              blank=True,
                              choices=VISIT_STATUSES)
    payer = models.ForeignKey(State, verbose_name=u'Плательщик',
                              related_name='payer_in_visit',
                              limit_choices_to={'type':u'j'}, 
                              null=True, blank=True)
    source_lab = models.ForeignKey(State, verbose_name=u'Лаборатория',
                              related_name='source_lab_in_visit',
                              limit_choices_to={'type__in':(u'b',u'm')}, 
                              null=True, blank=True,
                              help_text=u'Выбрать лабораторию, из которой поступил материал')
    barcode = models.OneToOneField(Barcode, null=True, blank=True)
    total_price = models.DecimalField(u'Сумма, руб.', max_digits=10, 
                                      decimal_places=2, default=0, 
                                      null=True, blank=True)
    total_paid = models.DecimalField(u'Оплаченная сумма, руб.', 
                                     max_digits=10, decimal_places=2, 
                                     default=0, null=True, blank=True)
    bill_date = models.DateTimeField(u'Подлежит оплате до', 
                                     null=True, blank=True)
    payment_status = models.CharField(u'Статус оплаты', max_length=1, 
                                      choices=PAYMENT_STATUSES, 
                                      null=True, blank=True)
    payment_type = models.CharField(u'Способ оплаты', max_length=1, 
                                    default=u'н', 
                                    choices=PAYMENT_TYPES)
    insurance_policy = models.ForeignKey(InsurancePolicy, null=True, blank=True)
    discount = models.ForeignKey(Discount, 
                                 verbose_name=u'Скидка',
                                 null=True, blank=True)
    discount_value = models.DecimalField(u'Размер скидки',
                                         max_digits=10, decimal_places=2, default=0,
                                         null=True, blank=True)
    total_discount = models.DecimalField(u'Сумма скидки, руб.', 
                                     max_digits=10, decimal_places=2, 
                                     default=0, null=True, blank=True)
    is_billed = models.BooleanField(u'Проведен', default=False)
    comment = models.TextField(u'Дополнительная информация, комментарии',
                               null=True, blank=True)
    
    objects = models.Manager()
    
    def generate_laborder(self):
        services = self.orderedservice_set.all()
        for service in services:
            service.to_lab()
    
    def ordered_services(self):
        services = []
        for service in self.orderedservice_set.all().order_by('-id'):
            services.append({
                'id':str(service.id),
                'service':str(service.service_id),
                'staff':service.staff_id,
                'count':service.count,
                'execution_place':service.execution_place_id
            })
        return simplejson.dumps(services)

    def staff_list(self):
        values = self.services.values_list('id',flat=True)
        staff = {}
        for k in self.staff:
            id,s = k.split(":")
            staff[int(id)] = int(s)
        return simplejson.dumps(staff)
    
    def zid(self):
        return str(self.pk).zfill(5)
    zid.short_description = u'№ заказа'
    
    def get_absolute_url(self):
        return u"/visit/visit/%s/" % self.id

    def __unicode__(self):
        return u"№%s %s" % (self.zid(), 
                              #self.created.strftime("%d.%m.%Y"), 
                              self.patient.full_name()
                              )
        
    def full_name(self):
        return self.patient.full_name()
    full_name.short_description = u'Пациент'
    
    def update_total_price(self):
        result = self.orderedservice_set.all().aggregate(sum=Sum('total_price'))
        self.total_price = result['sum'] or 0
        if self.discount:
            self.discount_value = self.discount.value
            self.total_discount = self.total_price*self.discount.value/100
        self.save()
        self.patient.update_account()
        
    def discount_price(self):
        return self.total_price-self.total_discount
    
    def save(self, *args, **kwargs):
        self.is_billed = True
        
        if self.insurance_policy:
            try:
                referral = Referral.objects.get(name=self.insurance_policy.insurance_state.name)
            except ObjectDoesNotExist:
                referral = Referral.objects.create(name=self.insurance_policy.insurance_state.name, operator=self.operator)
            self.referral = referral
            
        super(Visit, self).save(*args, **kwargs)
    
    class Meta:
        verbose_name = u"прием"
        verbose_name_plural = u"приемы"
        ordering = ('-created',)


class PlainVisit(Visit):
    """
    """
    
    class Meta:
        proxy=True
        verbose_name = u"прием (адм.)"
        verbose_name_plural = u"приемы (адм.)"
        

class ReferralVisit(Visit):
    """
    """
    
    class Meta:
        proxy=True
        verbose_name = u"прием (врачи/орг.)"
        verbose_name_plural = u"приемы (врачи/орг.)"
        

class OrderedService(make_operator_object('ordered_service')):
    """
    """
    modified = models.DateTimeField(auto_now=True)
    order = models.ForeignKey(Visit)
    service = models.ForeignKey(BaseService, verbose_name=u'Услуга')
    execution_place = models.ForeignKey(State, verbose_name=u'Место выполнения', 
                                        default=settings.MAIN_STATE_ID)
    executed = models.DateTimeField(u'Дата выполнения', null=True, blank=True)
    staff = models.ForeignKey(Position, null=True, blank=True, verbose_name=u'Врач')
    price = models.DecimalField(u'Цена услуги', 
                                max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(u'Итого', 
                                max_digits=10, decimal_places=2, default=0)
    test_form = models.CharField(u'Форма теста', 
                                 choices=TEST_FORM, 
                                 max_length=1, 
                                 blank=True, null=True)
    count = models.IntegerField(u'Количество', default=1)
    status = models.CharField(u'Статус', 
                              max_length=1, 
                              choices=ORDER_STATUSES, 
                              default=u'т')
    print_date = models.DateTimeField(u'Время печати', blank=True, null=True)
    sampling = models.ForeignKey('lab.Sampling', 
                                 null=True, blank=True)
    
    objects = models.Manager()

    def __unicode__(self):
        return u"%s - %s" % (self.order.patient, self.service)
    
    def save(self, *args, **kwargs):
        price = self.service.price(self.execution_place)
        opr = OPERATIONS[self.order.cls]
        self.price = price*opr
        self.total_price = price*self.count
        super(OrderedService, self).save(*args, **kwargs)
        self.order.update_total_price()
    
    @transaction.commit_on_success
    def to_lab(self):
        """
        """
        visit = self.order
        s = self.service
        ext_service = self.service.extendedservice_set.get(state=self.execution_place)
        if s.is_lab():
            
            sampling, created = Sampling.objects.get_or_create(visit=visit,
                                                               laboratory=self.execution_place,
                                                               is_barcode=ext_service.is_manual,
                                                               tube=ext_service.tube)
            if created:
                logger.info('sampling id%s %s created' % (sampling.id,sampling.__unicode__()) )
                #if ext_service.is_manual:
                #    sampling.number = generate_numerator()
                #    sampling.save()
                #    logger.info( "Generated number: %s" % sampling.number )
            else:
                logger.info('sampling id%s %s found' % (sampling.id,sampling.__unicode__()) )
            
            
    
            lab_order, created = LabOrder.objects.get_or_create(visit=visit,  
                                                                laboratory=self.execution_place,
                                                                lab_group=s.lab_group)
            if created:
                logger.info('laborder %s created' % lab_order.id)
            else:
                logger.info('laborder %s found' % lab_order.id)
                
            for item in self.service.analysis_set.all():
                result, created = Result.objects.get_or_create(order=lab_order,
                                                               analysis=item, 
                                                               sample=sampling)
                if created:
                    logger.info('result id%s %s created' % (result.id,result.__unicode__()) )
                else:
                    logger.info('result id%s %s found' % (result.id,result.__unicode__()) )
    
            if sampling:
                self.sampling = sampling
                self.save()
                
    def get_absolute_url(self):
        return u"/admin/visit/orderedservice/%s/" % self.id
                
    class Meta:
        verbose_name = u"услуга"
        verbose_name_plural = u"услуги"
        ordering = ('-order__created',)
        

class Refund(make_operator_object('refund')):
    """
    """
    modified = models.DateTimeField(auto_now=True)
    visit = models.ForeignKey(Visit)
    reason = models.CharField(u'Причина', max_length=1, choices=CANCEL_STATUSES, default=u'с')
    

class RefundService(make_operator_object('refund_service')):
    """
    """
    refund = models.ForeignKey(Refund)
    ordered_service = models.OneToOneField(OrderedService)
    

### SIGNALS

@transaction.commit_on_success
def OrderedServicePostDelete(sender, **kwargs):
    """
    """
    obj = kwargs['instance']
    visit = obj.order
    visit.update_total_price()
    #visit
    #p = visit.patient
    #p.billed_account -= obj.total_price
    #p.save()
    analysis_list = obj.service.analysis_set.all()
    Result.objects.filter(order__visit=visit, analysis__in=analysis_list).delete()
    
post_delete.connect(OrderedServicePostDelete, sender=OrderedService)



@transaction.commit_on_success
def BarcodeGenerator(sender, **kwargs):
    """
    """
    if kwargs['created']:
        visit = kwargs['instance']
        new_barcode = Barcode.objects.create() 
        visit.barcode = new_barcode
        visit.save()
            
post_save.connect(BarcodeGenerator, sender=Visit)              




import reversion

#reversion.register(Referral)      