{% if staff__staff %}
   and Tstaff.id = '{{staff__staff}}'
{% endif %}
{% if order__cls %}
   and Tvis.cls = '{{order__cls}}'
{% endif %}
{% if order__patient %}
   and Tvis.patient_id = '{{order__patient}}'
{% endif %}
{% if staff__department %}
   and Tdpr.id = '{{staff__department}}'
{% endif %}
{% if order__referral %}
   and Tvis.referral_id = '{{order__referral}}'
{% endif %}
{% if from_place_filial %}
   and Tvis.office.id = '{{from_place_filial}}'
{% endif %}
{% if from_lab %}
   and Tvis.source_lab_id = '{{from_lab}}'
{% endif %}
{% if execution_place_office %}
   and Tstgr.id = '{{execution_place_office}}'
{% endif %}
{% if execution_place_filial %}
   and Tvis.office_id = '{{execution_place_filial}}'
{% endif %}
{% if order__payment_type %}
   and Tvis.payment_type = '{{order__payment_type}}'
{% endif %}
