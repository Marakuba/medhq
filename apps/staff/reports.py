# -*- coding: utf-8 -*-

import numpy as np
from reporting.pandas_based import PandasReport, Config, SqlDataSource, Header, Column, Total
from reporting import register


@register('staff-daily')
class StaffDailyReport(PandasReport):
    """
    """

    config = Config(
        source=SqlDataSource("""
SELECT
    Tstaff.last_name ||' '|| substr(Tstaff.first_name,1,1)||'.' ||substr(Tstaff.mid_name,1,1)||'.' as staff,
    Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as patient,
    to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created,
    TTbarcode.id as barcode,
    Tserv.name as service,
    TTvis.price as price,
    sum(TTvis.count) as count,
    sum(TTvis.count * TTvis.price) as total_price,
    round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as total_discount,
    sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price,
    Tvis.payment_type
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
    TTvis.count IS NOT NULL AND TTvis.price IS NOT NULL AND
    to_char(Tvis.created,'YYYY-MM-DD') BETWEEN '{{ start_date }}' AND '{{ end_date }}'
    {% if staff__staff %}
    AND Tstaff.id = {{ staff__staff }}
    {% endif %}
GROUP BY
    Tstaff.last_name,
    Tstaff.first_name,
    Tstaff.mid_name,
    Tvis.created,
    TTbarcode.id,
    Tvis.payment_type,
    Tpnt.last_name,
    Tpnt.first_name,
    Tpnt.mid_name,
    Tpolis.number,
    Tserv.id,
    Tserv.name,
    TTvis.price
ORDER BY
    staff,
    patient,
    created,
    barcode,
    service
        """),
        header=Header(
# field, verbose, attrs, renderer
            Column('patient', u'Пациент'),
            Column('barcode', u'№ приема'),
            Column('service', u'Наименование'),
            Column('payment_type', u'Форма оплаты'),
            Column('price', u'Цена', attrs={'class': 'number'}),
            Column('count', u'Количество', attrs={'class': 'number'}),
            Column('total_price', u'Сумма', attrs={'class': 'number'}),
            Column('total_discount', u'Скидка', attrs={'class': 'number'})
        ),
        totals=Total('count', 'total_price', 'total_discount', position='bottom', aggfunc=np.sum)
    )
