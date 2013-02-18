# -*- coding: utf-8 -*-

from django.db import models
from django.db.models.aggregates import Sum

from service.models import BaseService
from visit.models import Referral

from .managers import BonusRuleManager


class BonusServiceGroup(models.Model):
    name = models.CharField(u'Название', max_length=50)
    slug = models.SlugField(max_length=50)
    services = models.ManyToManyField(BaseService, verbose_name=u'Услуги')

    class Meta:
        verbose_name = u'группа услуг'
        verbose_name_plural = u'группы услуг'

    def __unicode__(self):
        return self.name


class BonusRule(models.Model):
    OBJECT_TYPE_STAFF = u'staff'
    OBJECT_TYPES = (
        (OBJECT_TYPE_STAFF, u'Врач'),
    )

    CATEGORY_V = u'в'
    CATEGORY_L = u'л'
    CATEGORY_K = u'к'
    CATEGORIES = (
        (CATEGORY_V, u'Врач/Организация'),
        (CATEGORY_L, u'Лечащий врач'),
        (CATEGORY_K, u'Врач клиники')
    )

    SOURCE_ORDER_REFERRAL = u'order__referral'
    SOURCE_ASSIGMENT_REFERRAL = u'assigment__referral'
    SOURCE_STAFF_STAFF_REFERRAL = u'staff__staff__referral'
    SOURCES = (
        (SOURCE_ORDER_REFERRAL, u'Внешнее направление'),
        (SOURCE_ASSIGMENT_REFERRAL, u'Внутренее направление'),
        (SOURCE_STAFF_STAFF_REFERRAL, u'Собственные услуги'),
    )

    object_type = models.CharField(u'Объект', max_length=10, choices=OBJECT_TYPES, default=OBJECT_TYPE_STAFF)
    category = models.CharField(u'Категория', max_length=30, choices=CATEGORIES)
    source = models.CharField(u'Источник аналитики', max_length=50, choices=SOURCES)
    is_active = models.BooleanField(u'Активно', default=True)

    objects = BonusRuleManager()

    class Meta:
        verbose_name = u'правило'
        verbose_name_plural = u'правила'

    def __unicode__(self):
        return u'%s::%s::%s' % (self.id, self.get_category_display(), self.get_source_display())


class BonusRuleItem(models.Model):
    """
    """
    OPERATION_PERCENT = u'%'
    OPERATION_ABS = u'a'
    OPERATIONS = (
        (OPERATION_PERCENT, u'%'),
        (OPERATION_ABS, u'abs'),
    )

    rule = models.ForeignKey(BonusRule, verbose_name=u'Правило')
    service_group = models.ForeignKey(BonusServiceGroup, verbose_name=u'Группа услуг', null=True, blank=True)
    operation = models.CharField(u'Тип', max_length=1, choices=OPERATIONS, default=OPERATION_PERCENT)
    on_date = models.DateField(u'Дата')
    value = models.DecimalField(u'Значение', max_digits=8, decimal_places=2)
    referral = models.ForeignKey(Referral, verbose_name=u'Врач', null=True, blank=True)
    with_discounts = models.BooleanField(u'Учитывать скидки', default=True)

    class Meta:
        verbose_name = u'настройки правила'
        verbose_name_plural = u'настройки правил'

    def __unicode__(self):
        return u'<<BonusRule %s>>' % self.id


class BonusRuleItemHistory(models.Model):
    rule_item = models.ForeignKey(BonusRuleItem, verbose_name=u'настройка правил')
    on_date = models.DateField(u'Дата')
    value = models.DecimalField(u'Значение', max_digits=8, decimal_places=2)

    class Meta:
        verbose_name = u'история настроек'
        verbose_name_plural = u'истории настроек'

    def __unicode__(self):
        pass


class Calculation(models.Model):
    start_date = models.DateField(u'Начало периода')
    end_date = models.DateField(u'Конец периода')
    category = models.CharField(u'Категория', max_length=30, choices=BonusRule.CATEGORIES)
    referral_list = models.ManyToManyField(Referral, verbose_name=u'Врачи', blank=True)
    comment = models.TextField(u'Комментарий', blank=True)

    class Meta:
        verbose_name = u'начисление'
        verbose_name_plural = u'начисления'

    def get_amount(self):
        result = self.calculationitem_set.all().aggregate(sum=Sum('value'))
        return result['sum'] or 0

    def __unicode__(self):
        return u"Документ №%s" % self.id


from visit.models import OrderedService


class CalculationItem(models.Model):
    calculation = models.ForeignKey(Calculation, verbose_name=u'Начисление')
    referral = models.ForeignKey(Referral, verbose_name=u'Врач')
    source = models.CharField(u'Источник аналитики', max_length=50, choices=BonusRule.SOURCES)
    service_group = models.ForeignKey(BonusServiceGroup, null=True, blank=True)
    ordered_service = models.ForeignKey(OrderedService, verbose_name=u'Продажа')
    value = models.DecimalField(u'Сумма бонуса', max_digits=8, decimal_places=2)

    class Meta:
        verbose_name = u'позиция начисления'
        verbose_name_plural = u'позиции начислений'

    def __unicode__(self):
        return u'Позиция начисления к документу %s' % self.calculation.id
