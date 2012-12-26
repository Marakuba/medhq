# -*- coding: utf-8 -*-


from reporting.pandas_based import PandasReport, PivotConfig, SqlDataSource, Header, PivotRows, PivotResult
from reporting import register


@register('department-sales')
class DepartmentSalesReport(PandasReport):
    """
    """

    config = PivotConfig(
        source=SqlDataSource("""
            SELECT
                Tdepartment.name || '_' || Tstate.name || '_' || Tvisit.payment_type as dkey,
                Tdepartment.name as dep_name,
                Tstate.name as state_name,
                Tvisit.payment_type,
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
                AND Tdepartment.name IS NOT NULL
            GROUP BY
                Tdepartment.name,
                Tstate.name,
                Tvisit.payment_type
            ORDER BY
                Tdepartment.name,
                Tstate.name

            """),
        rows=['dep_name', 'state_name'],
        cols=['payment_type', ],
        values=['total_count', 'total_price'],
        header=Header(
            PivotRows({
                    'dep_name': u'Отделение',
                }),
            PivotResult('total_count', u'Общее количество', {
                    u'б': u'Безналичный перевод',
                    u'н': u'Наличная оплата',
                    u'д': u'ДМС',
                }, attrs={
                    'class': 'number'
                }),
            PivotResult('total_price', u'Общая сумма', attrs={
                    'class': 'number'
                })
        )
    )
