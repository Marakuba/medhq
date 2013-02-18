# -*- coding: utf-8 -*-


import datetime

from django.db import connection

from .models import BonusRule, Calculation, CalculationItem
from visit.models import OrderedService


def get_related(obj, attrs):
    rel = obj
    for attr in attrs.split('__'):
        rel = getattr(rel, attr)
        if rel is None:
            break

    return rel


def process_calculation(calculation_id):
    calculation = Calculation.objects.get(id=calculation_id)
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
            lookup = {
                "%s__referral_type__iexact" % rule.source: rule.category
            }
            referral_list = calculation.referral_list.all().values_list('id', flat=True)
            if referral_list:
                lookup["%s__id__in" % rule.source] = referral_list
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
                    service_group=item.service_group,
                    ordered_service=obj,
                    value=value
                )

    return calculation.get_amount()


def get_detail_result(calculation_id, referral_id=None):
    calculation = Calculation.objects.get(id=calculation_id)
    query = """
SELECT
    CalcItem.id, CalcItem.source, CalcItem.value, Ref.name as ref_name,
    BaseSrv.name as serv_name, ServGroup.name as group_name
FROM bonus_calculationitem as CalcItem
JOIN bonus_bonusservicegroup as ServGroup ON ServGroup.id = CalcItem.service_group_id
JOIN visit_referral as Ref ON Ref.id = CalcItem.referral_id
JOIN visit_orderedservice as OrdServ ON OrdServ.id = CalcItem.ordered_service_id
JOIN service_baseservice as BaseSrv on BaseSrv.id = OrdServ.service_id
WHERE
    CalcItem.calculation_id=%s
"""
    if referral_id:
        query += " AND CalcItem.referral_id=%s" % referral_id

    cursor = connection.cursor()
    cursor.execute(query % calculation.id)
    rows = cursor.fetchall()
    desc = cursor.description
    cols = [col[0] for col in desc]
    cursor.close()
    return rows, cols


def get_category_result(calculation_id):
    calculation = Calculation.objects.get(id=calculation_id)
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
) as Q%(source)s ON Q%(source)s.referral_id = bci.referral_id
"""
    query_tpl = """
SELECT
    bci.referral_id, vref.name, %(cols)s, sum(value) as total
FROM bonus_calculationitem as bci
JOIN visit_referral as vref ON vref.id = bci.referral_id
%(joins)s
WHERE bci.calculation_id=%(id)s
GROUP BY
    bci.referral_id, vref.name, %(groupcols)s
"""
    columns = col_mapping[calculation.category]
    joins = []
    cols = []
    groupcols = []
    for i, col in enumerate(columns):
        cols.append("Q%(col)s.val as q%(col)s" % {'col': col})
        groupcols.append("Q%(col)s.val" % {'col': col})
        joins.append(join_tpl % {
            'source': col,
            'id': calculation.id,
            'seq': i
        })
    params = {
        'id': calculation.id,
        'cols': ", ".join(cols),
        'groupcols': ", ".join(groupcols),
        'joins': "\n".join(joins)
    }

    query = query_tpl % params

    cursor = connection.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    desc = cursor.description
    cols = [col[0] for col in desc]
    cursor.close()
    return rows, cols
