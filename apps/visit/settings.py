# -*- coding: utf-8 -*-
from django.conf import settings



PAYMENT_TYPES = [
    (u'н',u'Касса'),
    (u'б',u'Юридическое лицо'),
    (u'д',u'ДМС'),
    (u'к',u'Корпоративные расчеты'),
]

try:
    CUSTOM_PAYMENT_TYPES = settings.CUSTOM_PAYMENT_TYPES
    PAYMENT_TYPES += CUSTOM_PAYMENT_TYPES
except:
    pass

PAYMENT_STATUSES = (
    (u'н',u'Не оплачено'),
    (u'о',u'Ожидание разрешения оплаты'),
    (u'ч',u'Частичная оплата'),
    (u'п',u'Оплачено'),
)

STOP_ON_TYPES = (u'д',)

CANCEL_STATUSES = (
    (u'0',u'Отменен пациентом'),
    (u'1',u'Отменен врачем'),
    (u'с',u'Сторнирован оператором'),
)

VISIT_STATUSES = (
    (u'т',u'Текущий'),
    (u'з',u'Завершен'),
) + CANCEL_STATUSES

ORDER_STATUSES = VISIT_STATUSES + (
    (u'л',u'Отправлен в лабораторию'),
    (u'!',u'Ошибка отправки'),
    (u'>',u'В обработке'),
)
