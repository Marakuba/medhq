# -*- coding: utf-8 -*-


# from reporting.pandas_based import PandasReport, PivotConfig, SqlDataSource, Header, PivotRows, PivotResult, Totals
from reporting import register


# @register('department-sales')
# class DepartmentSalesReport(PandasReport):
#     """
#     """

#     config = PivotConfig(
#         source=SqlDataSource("""
#             SELECT
#                 Tdepartment.name || '_' || Tstate.name || '_' || Tvisit.payment_type as dkey,
#                 Tdepartment.name as dep_name,
#                 Tstate.name as state_name,
#                 Tvisit.payment_type,
#                 sum(Tordservice.count) as total_count,
#                 round(sum(Tordservice.total_price),2) as total_price
#             FROM
#                 visit_orderedservice Tordservice
#             LEFT OUTER JOIN visit_visit Tvisit on Tordservice.order_id=Tvisit.id
#             LEFT OUTER JOIN staff_position Tposition on Tordservice.staff_id=Tposition.id
#             LEFT OUTER JOIN state_department Tdepartment on Tposition.department_id=Tdepartment.id
#             LEFT OUTER JOIN state_state Tstate on Tdepartment.state_id=Tstate.id
#             WHERE
#                 to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
#                 AND Tdepartment.name IS NOT NULL
#             GROUP BY
#                 Tdepartment.name,
#                 Tstate.name,
#                 Tvisit.payment_type
#             ORDER BY
#                 Tdepartment.name,
#                 Tstate.name

#             """),
#         rows=['dep_name', 'state_name'],
#         cols=['payment_type', ],
#         values=['total_count', 'total_price'],
#         header=Header(
#             PivotRows({
#                     'dep_name': u'Отделение',
#                 }),
#             PivotResult('total_count', attrs={
#                     'class': 'number'
#                 }),
#             PivotResult('total_price', attrs={
#                     'class': 'number'
#                 })
#         ),
#         totals=Totals(u'total_count_б', )
#     )

import numpy as np
from reporting.pandas import PandasReport, Config, SqlDataSource, Header,\
    Column, NumberColumn, Totals, Total, Group, Agg


@register('department-sales')
class DepartmentSalesReport(PandasReport):
    """
    """

    config = Config(
        source=SqlDataSource("""
SELECT
    Tdepartment.name as dep_name,
    Tstate.name as state_name,
    Dq.total_count as dtc,
    Cq.total_count as ctc,
    Dq.total_price as dtp,
    Cq.total_price as ctp
FROM
    visit_orderedservice Tordservice
LEFT OUTER JOIN visit_visit Tvisit on Tordservice.order_id=Tvisit.id
LEFT OUTER JOIN staff_position Tposition on Tordservice.staff_id=Tposition.id
LEFT OUTER JOIN state_department Tdepartment on Tposition.department_id=Tdepartment.id
LEFT OUTER JOIN state_state Tstate on Tdepartment.state_id=Tstate.id

LEFT OUTER JOIN (
    SELECT
        Tdepartment.id as dep_id,
        Tstate.id as state_id,
        sum(Tordservice.count) as total_count,
                round(sum(Tordservice.total_price),2) as total_price
        FROM
        visit_orderedservice Tordservice
    LEFT OUTER JOIN visit_visit Tvisit on Tordservice.order_id=Tvisit.id
    LEFT OUTER JOIN staff_position Tposition on Tordservice.staff_id=Tposition.id
    LEFT OUTER JOIN state_department Tdepartment on Tposition.department_id=Tdepartment.id
    LEFT OUTER JOIN state_state Tstate on Tdepartment.state_id=Tstate.id
    WHERE
        to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
        AND Tvisit.payment_type = 'д'

    GROUP BY
        Tdepartment.id,
        Tstate.id

) AS Dq ON Dq.dep_id=Tdepartment.id AND Dq.state_id=Tstate.id

LEFT OUTER JOIN (
    SELECT
        Tdepartment.id as dep_id,
        Tstate.id as state_id,
        sum(Tordservice.count) as total_count,
                round(sum(Tordservice.total_price),2) as total_price
        FROM
        visit_orderedservice Tordservice
    LEFT OUTER JOIN visit_visit Tvisit on Tordservice.order_id=Tvisit.id
    LEFT OUTER JOIN staff_position Tposition on Tordservice.staff_id=Tposition.id
    LEFT OUTER JOIN state_department Tdepartment on Tposition.department_id=Tdepartment.id
    LEFT OUTER JOIN state_state Tstate on Tdepartment.state_id=Tstate.id
    WHERE
        to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
        AND Tvisit.payment_type = 'н'

    GROUP BY
        Tdepartment.id,
        Tstate.id

) AS Cq ON Cq.dep_id=Tdepartment.id AND Cq.state_id=Tstate.id

WHERE
    to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
    AND Tdepartment IS NOT NULL
    -- AND Dq.total_count > 0 AND Cq.total_count > 0 AND Dq.total_price > 0 AND Cq.total_price > 0
GROUP BY
    Tdepartment.name,
    Tstate.name,
    Dq.total_count,
    Cq.total_count,
    Dq.total_price,
    Cq.total_price
ORDER BY
    Tdepartment.name,
    Tstate.name
        """),
        header=Header(
# field, verbose, attrs, renderer
            Column('dep_name', u'Подразделение'),
            Column('state_name', u'Филиал'),
            NumberColumn('dtc', u'ДМС'),
            NumberColumn('ctc', u'Наличные'),
            NumberColumn('dtp', u'ДМС'),
            NumberColumn('ctp', u'Наличные')
        ),
        totals=Totals(
            Total('dtc'),
            Total('ctc'),
            Total('dtp'),
            Total('ctp'),
            # label_attrs={'colspan': 2}
        )
    )


@register('total-sales')
class TotalSalesReport(PandasReport):
    """
    """

    config = Config(
        source=SqlDataSource("""
SELECT
    '{{ start_date }}' || ' - ' || '{{ end_date }}' as period,
    (
        SELECT
            sum(total_price)
        FROM
            visit_visit as Tvisit
        WHERE
            to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
            AND Tvisit.payment_type = 'д' and Tvisit.office_id = 2
    ) as D2,
    (
        SELECT
            sum(total_price)
        FROM
            visit_visit as Tvisit
        WHERE
            to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
            AND Tvisit.payment_type = 'н' and Tvisit.office_id = 2
    ) as C2,
    (
        SELECT
            sum(total_price)
        FROM
            visit_visit as Tvisit
        WHERE
            to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
            AND Tvisit.payment_type = 'д' and Tvisit.office_id = 3
    ) as D3,
    (
        SELECT
            sum(total_price)
        FROM
            visit_visit as Tvisit
        WHERE
            to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
            AND Tvisit.payment_type = 'н' and Tvisit.office_id = 3
    ) as C3,
    (
        SELECT
            sum(total_price)
        FROM
            visit_visit as Tvisit
        WHERE
            to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
            AND Tvisit.payment_type = 'д' and Tvisit.office_id = 4
    ) as D4,
    (
        SELECT
            sum(total_price)
        FROM
            visit_visit as Tvisit
        WHERE
            to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
            AND Tvisit.payment_type = 'н' and Tvisit.office_id = 4
    ) as C4,
    (
        SELECT
            sum(count)
        FROM
            visit_orderedservice as Tordservice
        LEFT OUTER JOIN visit_visit Tvisit on Tordservice.order_id=Tvisit.id
        WHERE
            to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
            AND Tvisit.payment_type = 'д'
    ) as Dcnt,
    (
        SELECT
            sum(count)
        FROM
            visit_orderedservice as Tordservice
        LEFT OUTER JOIN visit_visit Tvisit on Tordservice.order_id=Tvisit.id
        WHERE
            to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
            AND Tvisit.payment_type = 'н'
    ) as Ccnt

            """),
        header=Header(
# field, verbose, attrs, renderer
            Column('period', u'Период'),
            Column('d2', u'ДМС', attrs={'class': 'number'}),
            Column('c2', u'Наличные', attrs={'class': 'number'}),
            Column('d3', u'ДМС', attrs={'class': 'number'}),
            Column('c3', u'Наличные', attrs={'class': 'number'}),
            Column('d4', u'ДМС', attrs={'class': 'number'}),
            Column('c4', u'Наличные', attrs={'class': 'number'}),
            Column('dcnt', u'ДМС', attrs={'class': 'number'}),
            Column('ccnt', u'Наличные', attrs={'class': 'number'}),
        ),
        # totals=Total('count', 'total_price', 'total_discount', position='bottom', aggfunc=np.sum)
    )


def service_group_renderer(v):
    GROUPS = {
        'ct': u'КТ',
        'mrt': u'МРТ',
    }
    return GROUPS.get(v, u'Другое')


from reporting.pandas import choices_renderer
from visit.settings import PAYMENT_TYPES


@register('contrast-sales')
class ContrastSalesReport(PandasReport):
    """
    """

    config = Config(
        source=SqlDataSource(u"""
SELECT
    get_mod_group(Tservice.name) as service_group,
    to_char(Tvisit.created,'DD.MM.YYYY') as created,
    Tservice.name,
    Tvisit.payment_type,
    Tordservice.count,
    Tordservice.price
FROM
    visit_orderedservice as Tordservice
LEFT OUTER JOIN visit_visit Tvisit on Tordservice.order_id=Tvisit.id
LEFT OUTER JOIN service_baseservice Tservice on Tordservice.service_id=Tservice.id
WHERE
    to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
    AND Tservice.name LIKE %s
ORDER BY
    Tvisit.created DESC
        """, params=[u"%с контрастом%"]),
        header=Header(
            Column('service_group', u'Группа', renderer=service_group_renderer),
            Column('created', u'Дата'),
            Column('name', u'Наименование'),
            Column('payment_type', u'Способ оплаты', renderer=choices_renderer(PAYMENT_TYPES)),
            NumberColumn('count', u'Количество'),
            NumberColumn('price', u'Цена')
        ),
        group_by=Group(
            columns=['service_group', ],
            attrs={
                # 'colspan': 3,
            },
            row_attrs={
                'class': 'group1',
            },
            agg=[
                Agg('count', attrs={'class':'number'}),
                Agg('price', attrs={'class':'number'}),
            ]
        ),
        totals=Totals(
            Total('count'),
            Total('price'),
            label_attrs={
                # 'colspan': 3
            }
        )
    )
