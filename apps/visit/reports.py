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


@register('staff-referral-patient')
class StaffReferralPatientReport(PandasReport):
    """
    """

    config = Config(
        source=SqlDataSource("""
SELECT
    Tstaff.last_name ||' '|| substr(Tstaff.first_name,1,1)||'.' ||substr(Tstaff.mid_name,1,1)||'., '||Tpstf.title as staff,
    Trefrl.name as referral,
    to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created,
    Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as patient,
    Tpolis.number as polis,
    TTbarcode.id as order,
    Tserv.code as code,
    Tserv.name as service,
    sum(TTvis.count) as count,
    sum(TTvis.count * TTvis.price) as sum,
    round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as discount,
    sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_sum
FROM
    public.visit_visit Tvis
    left outer join public.numeration_barcode TTbarcode on TTbarcode.id = Tvis.barcode_id
    left outer join public.visit_orderedservice TTvis on TTvis.order_id = Tvis.id
    left outer join public.state_state Tstate on Tstate.id = TTvis.execution_place_id
    left outer join public.service_baseservice Tserv on Tserv.id = TTvis.service_id
    left outer join public.staff_position Tpstf on Tpstf.id = TTvis.staff_id
    left outer join public.staff_staff Tstaff on  Tstaff.id = Tpstf.staff_id
    left outer join public.state_department Tdpr on Tdpr.id = Tpstf.department_id
    left outer join public.patient_patient Tpnt on Tpnt.id = Tvis.patient_id
    left outer join public.visit_referral Trefrl on Trefrl.id = Tvis.referral_id
    left outer join public.visit_referralagent Trefrlagent on Trefrlagent.id = Trefrl.agent_id
    left outer join public.reporting_stategroup_state TTstgr on TTstgr.state_id = TTvis.execution_place_id
    left outer join public.reporting_stategroup Tstgr on Tstgr.id = TTstgr.stategroup_id
    left outer join public.patient_insurancepolicy Tpolis on Tpolis.id = Tvis.insurance_policy_id
    left outer join public.reporting_servicegroup_baseservice TTrepbsgp on TTrepbsgp.baseservice_id = Tserv.id
    left outer join public.reporting_servicegroup Trepbsgp on Trepbsgp.id = TTrepbsgp.servicegroup_id
WHERE
    TTvis.count is not null and TTvis.price is not null and
    to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
GROUP BY
    Tstaff.last_name,
    Tstaff.first_name,
    Tstaff.mid_name,
    Tpstf.title,
    Trefrl.name,
    Tvis.created,
    Tpolis.number,
    TTbarcode.id,
    Tpnt.last_name,
    Tpnt.first_name,
    Tpnt.mid_name,
    Tserv.id,
    Tserv.name
ORDER BY
    staff,
    referral,
    created,
    patient,
    polis,
    order,
    code,
    service"""),
        header=Header(
            Column('staff'),
            Column('referral'),
            Column('created'),
            Column('patient'),
            Column('order'),
            Column('service'),
            NumberColumn('count'),
            NumberColumn('sum'),
            NumberColumn('discount'),
            NumberColumn('clean_sum'),
        ),
        totals=Totals(
            Total('count'),
            Total('sum'),
            Total('discount'),
            Total('clean_sum'),
        )
    )


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
            sum(Tvisit.total_price)
        FROM
            visit_visit as Tvisit
--            visit_orderedservice as Tordservice
--        LEFT OUTER JOIN visit_visit Tvisit on Tordservice.order_id=Tvisit.id
        WHERE
            to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
            AND Tvisit.payment_type = 'д'
    ) as Dttp,
    (
        SELECT
            sum(Tvisit.total_price)
        FROM
            visit_visit as Tvisit
--            visit_orderedservice as Tordservice
--        LEFT OUTER JOIN visit_visit Tvisit on Tordservice.order_id=Tvisit.id
        WHERE
            to_char(Tvisit.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' and '{{ end_date }}'
            AND Tvisit.payment_type = 'н'
    ) as Cttp

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
            Column('dttp', u'ДМС', attrs={'class': 'number'}),
            Column('cttp', u'Наличные', attrs={'class': 'number'}),
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
    AND Tservice.id IN (2468,2462,4447,2209,2204,2201,4561,4562,4563,5266,2230,2839,2837,2836,2187,2190,2186,2182,2926,2175,2156,2148,4446,2131,2128,2127,4550,2850,2849,2131,2128,2127,2111,2432,2431,2430,2096,2094,2091,2425,2477,2476,2072,2915,2054,2052)
ORDER BY
    Tvisit.created DESC
        """),
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
                'class': 'group',
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
