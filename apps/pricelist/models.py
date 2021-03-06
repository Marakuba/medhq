# -*- coding: utf-8 -*-

from django.db import models
#from service.models import BaseService, ExtendedService

import datetime
from visit.settings import PAYMENT_TYPES
from copy import deepcopy
from django.db.models.signals import post_save, post_delete
from django.core.cache import cache


FIELD_RANGES = {
    'hour':     '00:00-23:59',
    'week_day': '0-6',
    'month_day': '1-31',
    'month':    '1-12'
}


class PriceType(models.Model):
    name = models.CharField(u'Наименование', max_length=50)
    slug = models.SlugField(u'SKU', default=u'', null=True, blank=True)
    hour = models.CharField(u'Часы', max_length=150, default=u'', null=True, blank=True)
    week_day = models.CharField(u'Дни недели', max_length=150, default=u'', null=True, blank=True)
    month_day = models.CharField(u'Дни месяца', max_length=150, default=u'', null=True, blank=True)
    month = models.CharField(u'Месяцы', max_length=150, default=u'', null=True, blank=True)
    active = models.BooleanField(u'Активно', default=True)
    priority = models.PositiveIntegerField(u'Приоритет', default=0, unique=False)

    def __unicode__(self):
        return u"%s" % self.name

    class Meta:
        verbose_name = u"тип цены"
        verbose_name_plural = u"типы цены"
        ordering = ('priority', 'active',)


class PriceRule(models.Model):
    price_type = models.ForeignKey(PriceType)
    slug = models.SlugField(u'SKU', default=u'', null=True, blank=True)
    hour = models.CharField(u'Часы', max_length=150, default=u'', null=True, blank=True)
    week_day = models.CharField(u'Дни недели', max_length=150, default=u'', null=True, blank=True)
    month_day = models.CharField(u'Дни месяца', max_length=150, default=u'', null=True, blank=True)
    month = models.CharField(u'Месяцы', max_length=150, default=u'', null=True, blank=True)
    active = models.BooleanField(u'Активно', default=True)
    priority = models.PositiveIntegerField(u'Приоритет', default=0, unique=True)

    def save(self, *args, **kwargs):
        # self.is_billed = True

        # print 'priority'
        # import pdb; pdb.set_trace()

        super(PriceRule, self).save(*args, **kwargs)

    def get_periods(self):
        """
        возвращает таблицу периодов.
        Поля таблицы:
        hour_from,hour_to,week_day_from,week_day_to, month_day_from, month_day_to, month_from, month_to,priority
        """
        periods = [{'id': self.price_type.id, 'priority': self.priority}]
        fields = ['hour', 'week_day', 'month_day', 'month']
        for field in fields:
            periods = self.get_range(field, periods)
        return periods

    def get_range(self, field, table):
        fvalue = getattr(self, field)
        value_list = fvalue.split(', ')
        for v in value_list:
            table = self.set_period(v, field, table)
        return table

    def set_period(self, value, field, table):
        if not value:
            value = FIELD_RANGES[field]
        values = value.split('-')
        if not (field == 'hour'):
            values = [int(v) for v in values]
        if len(values) > 1:
            field_from, field_to = values
        else:
            field_from, field_to = [values[0], values[0]]

        """
        Если таблица table пустая, то создаем новую запись, вносим значения в соответствующие поля
        Если в таблице есть записи, то если в них нет текущего поля, то просто добавляем его
        А если есть уже такое поле, то значит это перечисление периодов - копируем содержимое таблицы,
        в соответствующие поля вставляем текущие значения и добавляем полученные строки к таблице table
        """
        if not len(table):
            period_item = {}
            period_item[field + '_from'] = field_from
            period_item[field + '_to'] = field_to
            table = [period_item]
        else:
            if not field + '_from' in table[0]:
                for period_item in table:
                    period_item[field + '_from'] = field_from
                    period_item[field + '_to'] = field_to
            else:
                ctable = deepcopy(table)
                for period_item in ctable:
                    period_item[field + '_from'] = field_from
                    period_item[field + '_to'] = field_to
                table += ctable
#        import pdb; pdb.set_trace()
        return table

    def __unicode__(self):
        return u"%s %s" % (self.id, self.price_type.name)

    class Meta:
        verbose_name = u"правило типа цены"
        verbose_name_plural = u"правила типов цен"
        ordering = ('priority', 'active',)


PRICE_TYPES = (
    (u'r', u'Розничная'),
    (u'z', u'Закупочная'),
)


class Price(models.Model):
    extended_service = models.ForeignKey('service.ExtendedService', blank=True, null=True)
    type = models.ForeignKey(PriceType, verbose_name=u'Тип цены', blank=True, null=True)
    payment_type = models.CharField(u'Способ оплаты', max_length=1,
                                    default=u'н',
                                    choices=PAYMENT_TYPES,
                                    blank=True)
    price_type = models.CharField(u'Тип цены!', max_length=1, choices=PRICE_TYPES)
    value = models.DecimalField(u'Сумма, руб.', max_digits=10, decimal_places=2,
                                null=True)
    on_date = models.DateField(u'Начало действия', default=datetime.date.today())
    payer = models.ForeignKey('state.State', verbose_name=u'Плательщик',
                              related_name='payer_in_pricelist',
                              null=True, blank=True)

    def __unicode__(self):
        return u"<<PRICE OBJECT %s %s>>" % (self.extended_service.base_service, self.on_date)
#        return smart_unicode(u"%s - %s" % (self.extended_service.state, self.get_price_type_display()))

    class Meta:
        verbose_name = u"цена"
        verbose_name_plural = u"цены"
        get_latest_by = "on_date"


DISCOUNT_TYPES = (
    (u'accum', u'Накопительная'),
    (u'gen', u'Общая'),
    (u'pens', u'Пенсионная'),
    (u'admin', u'Административная'),
    (u'arc', u'Архив'),
)


class Discount(models.Model):
    """
    """
    type = models.CharField(u'Тип', max_length=5, default=u'gen', choices=DISCOUNT_TYPES)
    name = models.CharField(u'Наименование', max_length=30)
    value = models.DecimalField(u"Размер, %.", max_digits=5, decimal_places=2)
    min = models.DecimalField(u'Сумма от', max_digits=10, decimal_places=2, default=0.0)
    max = models.DecimalField(u'Сумма до', max_digits=10, decimal_places=2, default=0.0)
    comment = models.TextField(u"Комментарий", blank=True)

    def __unicode__(self):
        return u"%s %s" % (self.name, self.value)

    class Meta:
        verbose_name = u'скидка'
        verbose_name_plural = u'скидки'
        ordering = ('name',)


def build_period_table():
    pt_list = PriceRule.objects.filter(active=True)
    period_table = []
    for pt in pt_list:
        period_table += pt.get_periods()
    cache.set('periods', period_table, 24 * 60 * 60 * 30)
    return period_table


def set_period_cache(sender, **kwargs):
    build_period_table()

post_save.connect(set_period_cache, sender=PriceRule)
post_delete.connect(set_period_cache, sender=PriceRule)
