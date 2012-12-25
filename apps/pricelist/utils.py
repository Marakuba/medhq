# -*- coding: utf-8 -*-

import datetime
from constance import config
from state.models import State
from operator import itemgetter
from django.core.cache import cache
from pricelist.models import build_period_table


def get_actual_ptype(date=None, payer=None, payment_type=u'н'):

    """
    Возвращает id актуального на текущий момент типа цены PriceType
    date - дата, на которую определяем тип цены
    payer - id плательщика
    payment_type - id типа оплаты из PAYMENT_TYPES
    """

    # Если передан плательщик и у него указан тип цены, возвращаем его
    if payer:
        try:
            payer = State.objects.get(id=payer)
        except:
            raise Exception('payer not found "%s"' % payer)
        if payer.price_type:
            return payer.price_type.id

    # Если тип оплаты не касса, и в настройках указан соответствующий тип цены
    # по умолчанию, то возвращаем его
    if payment_type == u'д':
        if config.DEFAULT_PRICETYPE_INSURANCE:
            return config.DEFAULT_PRICETYPE_INSURANCE
    elif payment_type == u'б':
        if config.DEFAULT_PRICETYPE_NONCASH:
            return config.DEFAULT_PRICETYPE_NONCASH
    elif payment_type == u'к':
        if config.DEFAULT_PRICETYPE_CORP:
            return config.DEFAULT_PRICETYPE_CORP

    date = date or datetime.datetime.now()
    t = cache.get('periods') or build_period_table()
    now = "%02d:%02d" % (date.hour, date.minute)
    r = filter(lambda x: (now >= x['hour_from']) \
             and (now <= x['hour_to']) \
             and (x['month_day_from'] <= date.day) and (x['month_day_to'] >= date.day) \
             and (date.weekday() >= x['week_day_from']) and (date.weekday() <= x['week_day_to']) \
             and (date.month >= x['month_from']) and (date.month <= x['month_to']), t)
    r = sorted(r, key=itemgetter('priority'), reverse=True)
    if len(r) == 0:
        if config.DEFAULT_PRICETYPE:
            return config.DEFAULT_PRICETYPE
        else:
            raise Exception('default price type is not configured')
    # import pdb; pdb.set_trace()
    return r[0]['id']
