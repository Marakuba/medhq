FROM 
public.visit_visit Tvis 
left outer join public.visit_orderedservice TTvis on TTvis.order_id = Tvis.id 
left outer join public.state_state Tstate on Tstate.id = TTvis.execution_place_id 
left outer join public.service_baseservice Tserv on Tserv.id = TTvis.service_id 
left outer join public.staff_position Tpstf on Tpstf.id = TTvis.staff_id 
left outer join public.staff_staff Tstaff on Tstaff.id = Tpstf.staff_id 
left outer join public.state_department Tdpr on Tdpr.id = Tpstf.department_id 
left outer join public.patient_patient Tpnt on Tpnt.id = Tvis.patient_id 
left outer join public.visit_referral Trefrl on Trefrl.id = Tvis.referral_id 
left outer join public.visit_referralagent Trefrlagent on Trefrlagent.id = Trefrl.agent_id 
left outer join public.reporting_stategroup_state TTstgr on TTstgr.state_id = TTvis.execution_place_id 
left outer join public.reporting_stategroup Tstgr on Tstgr.id = TTstgr.stategroup_id 
left outer join public.patient_insurancepolicy Tpolis on Tpolis.id = Tvis.insurance_policy_id 
left outer join public.reporting_servicegroup_baseservice TTrepbsgp on TTrepbsgp.baseservice_id = Tserv.id 
left outer join public.reporting_servicegroup Trepbsgp on Trepbsgp.id = TTrepbsgp.servicegroup_id