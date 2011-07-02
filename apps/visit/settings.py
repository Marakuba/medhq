# -*- coding: utf-8 -*-


PAYMENT_TYPES = [
    (u'н',u'Наличная оплата'),
    (u'б',u'Безналичный перевод'),
    (u'л',u'Евромед Лузана'),
    (u'д',u'ДМС'),
]

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
    (u'п',u'Предварительная запись'),
    (u'т',u'Текущий'),
    (u'з',u'Завершен'),
) + CANCEL_STATUSES

ORDER_STATUSES = VISIT_STATUSES