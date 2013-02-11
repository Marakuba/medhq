# -*- coding: utf-8 -*-

from django.db import models

from service.models import BaseService
from visit.models import Referral

from .managers import BonusRuleManager
# from staff.models import Staff


class BonusServiceGroup(models.Model):
    name = models.CharField(u'Название', max_length=50)
    slug = models.SlugField(max_length=50)
    services = models.ManyToManyField(BaseService, verbose_name=u'Услуги')

    class Meta:
        verbose_name = u'группа услуг'
        verbose_name_plural = u'группы услуг'

    def __unicode__(self):
        return self.name


OBJECT_TYPES = (
    (u'staff', u'Врач'),
)


CATEGORIES = (
    (u'в', u'Врач/Организация'),
    (u'л', u'Лечащий врач'),
    (u'к', u'Врач клиники')
)


SOURCES = (
    (u'order__referral', u'Внешнее направление'),
    (u'assigment__referral', u'Внутренее направление'),
    (u'staff__staff__referral', u'Собственные услуги'),
)


class BonusRule(models.Model):
    object_type = models.CharField(u'Объект', max_length=10, choices=OBJECT_TYPES, default=u'staff')
    category = models.CharField(u'Категория', max_length=30, choices=CATEGORIES)
    source = models.CharField(u'Источник аналитики', max_length=50, choices=SOURCES)
    is_active = models.BooleanField(u'Активно', default=True)

    objects = BonusRuleManager()

    class Meta:
        verbose_name = u'правило'
        verbose_name_plural = u'правила'

    def __unicode__(self):
        return u'%s::%s::%s' % (self.object_type, self.category, self.source)


OPERATIONS = (
    (u'%', u'%'),
    (u'a', u'abs'),
)


class BonusRuleItem(models.Model):
    rule = models.ForeignKey(BonusRule, verbose_name=u'Правило')
    service_group = models.ForeignKey(BonusServiceGroup, verbose_name=u'Группа услуг', null=True, blank=True)
    operation = models.CharField(u'Тип', max_length=1, choices=OPERATIONS, default="%")
    on_date = models.DateField(u'Дата')
    value = models.DecimalField(u'Значение', max_digits=8, decimal_places=2)
    # staff = models.ForeignKey(Staff, verbose_name=u'Врач', null=True, blank=True)
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
    category = models.CharField(u'Категория', max_length=30, choices=CATEGORIES)
    # staff_list = models.ManyToManyField(Staff, verbose_name=u'Врачи')
    referral_list = models.ManyToManyField(Referral, verbose_name=u'Врачи')
    comment = models.TextField(u'Комментарий', blank=True)

    class Meta:
        verbose_name = u'начисление'
        verbose_name_plural = u'начисления'

    def __unicode__(self):
        pass


from visit.models import OrderedService


class CalculationItem(models.Model):
    calculation = models.ForeignKey(Calculation, verbose_name=u'Начисление')
    # staff = models.ForeignKey(Staff, verbose_name=u'Врач')
    referral = models.ForeignKey(Referral, verbose_name=u'Врач')
    source = models.CharField(u'Источник аналитики', max_length=50, choices=SOURCES)
    ordered_service = models.ForeignKey(OrderedService, verbose_name=u'Продажа')
    value = models.DecimalField(u'Сумма бонуса', max_digits=8, decimal_places=2)

    class Meta:
        verbose_name = u'позиция начисления'
        verbose_name_plural = u'позиции начислений'

    def __unicode__(self):
        pass
