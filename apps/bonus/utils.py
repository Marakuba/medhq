# -*- coding: utf-8 -*-


import datetime

from .models import BonusRule, CalculationItem
from visit.models import OrderedService


def get_related(obj, attrs):
    rel = obj
    for attr in attrs.split('__'):
        rel = getattr(rel, attr)
        if rel is None:
            break

    return rel


def process_calculation(calculation):
    start = calculation.start_date
    end = calculation.end_date

    s = datetime.datetime(start.year, start.month, start.day, 0, 0, 0)
    e = datetime.datetime(end.year, end.month, end.day, 23, 59, 59)
    services = OrderedService.objects.filter(
        order__created__range=[s, e]
    )

    rules = BonusRule.objects.active().filter(category=calculation.category)

    for rule in rules:
        items = rule.bonusruleitem_set.filter(on_date__lte=start)
        for item in items:
            s = services.filter()
            if item.service_group:
                s = s.filter(service__in=item.service_group.services.all())
            # if item.staff:
            #     s = s.filter(staff=item.staff)
            lookup = {
                "%s__referral_type__iexact" % rule.source: rule.category
            }
            s = s.filter(**lookup)
            for obj in s:
                value = 0
                if item.operation == 'a':
                    value = item.value * obj.count
                elif item.operation == '%':
                    value = item.value * obj.total_price / 100
                    if item.with_discounts:
                        value = value * (100 - obj.order.discount_value) / 100

                referral = get_related(obj, rule.source)
                CalculationItem.objects.create(
                    calculation=calculation,
                    referral=referral,
                    source=rule.source,
                    ordered_service=obj,
                    value=value
                )


def get_detail_result(calculation):
    from django.db import connection
    query = """
SELECT
    CalcItem.id, CalcItem.source, CalcItem.value, Ref.name, BaseSrv.name
FROM bonus_calculationitem as CalcItem
JOIN visit_referral as Ref ON Ref.id = CalcItem.referral_id
JOIN visit_orderedservice as OrdServ ON OrdServ.id = CalcItem.ordered_service_id
JOIN service_baseservice as BaseSrv on BaseSrv.id = OrdServ.service_id
WHERE
    CalcItem.calculation_id=%s
"""

    cursor = connection.cursor()
    cursor.execute(query % calculation.id)
    rows = cursor.fetchall()
    cursor.close()
    return rows


def get_category_result(calculation):
    from django.db import connection
    col_mapping = {
        u'в': ['order__referral', ],
        u'л': ['staff__staff__referral', 'assigment__referral'],
        u'к': ['staff__staff__referral', 'assigment__referral'],
    }
    join_tpl = """
LEFT OUTER JOIN (
    SELECT referral_id, sum(value) as val
    FROM bonus_calculationitem
    WHERE source = '%(source)s' AND calculation_id = %(id)s
    GROUP BY
        referral_id
) as Q%(seq)s ON Q%(seq)s.referral_id = bci.referral_id
"""
    query_tpl = """
SELECT
    bci.referral_id, vref.name, %(cols)s
FROM bonus_calculationitem as bci
JOIN visit_referral as vref ON vref.id = bci.referral_id
%(joins)s
WHERE bci.calculation_id=%(id)s
GROUP BY
    bci.referral_id, vref.name, %(cols)s
"""
    columns = col_mapping[calculation.category]
    joins = []
    cols = []
    for i, col in enumerate(columns):
        cols.append("Q%s" % i)
        joins.append(join_tpl % {
            'source': col,
            'id': calculation.id,
            'seq': i
        })
    params = {
        'id': calculation.id,
        'cols': ", ".join(cols),
        'joins': "\n".join(joins)
    }

    query = query_tpl % params

    cursor = connection.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()
    return rows
