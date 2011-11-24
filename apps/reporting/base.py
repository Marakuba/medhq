# -*- coding: utf-8 -*-
from django.utils.encoding import smart_str
import datetime
from visit.settings import PAYMENT_TYPES
from django.conf import settings
#from models import GROUP_SERVICE_UZI, GROUP_SERVICE_LAB

try:
    GROUP_SERVICE_UZI = settings.GROUP_SERVICE_UZI
    GROUP_SERVICE_LAB = settings.GROUP_SERVICE_LAB
    GROUP_SERVICE_RADIO = settings.GROUP_SERVICE_RADIO
except:
    raise u"Нет настроек групп услуг"

class Report():
    """
    """
    
    query_str = u''
    verbose_name =''
    base_wuery_from_where = u"\
FROM \
  public.visit_visit Tvis \
  left outer join public.visit_orderedservice TTvis on TTvis.order_id = Tvis.id \
  left outer join public.state_state Tstate on Tstate.id = TTvis.execution_place_id \
  left outer join public.service_baseservice Tserv on Tserv.id = TTvis.service_id \
  left outer join public.staff_position Tpstf on Tpstf.id = TTvis.staff_id \
  left outer join public.staff_staff Tstaff on  Tstaff.id = Tpstf.staff_id \
  left outer join public.state_department Tdpr on Tdpr.id = Tpstf.department_id \
  left outer join public.patient_patient Tpnt on Tpnt.id = Tvis.patient_id \
  left outer join public.visit_referral Trefrl on Trefrl.id = Tvis.referral_id  \
  left outer join public.visit_referralagent Trefrlagent on Trefrlagent.id = Trefrl.agent_id  \
  left outer join public.reporting_stategroup_state TTstgr on TTstgr.state_id = TTvis.execution_place_id \
  left outer join public.reporting_stategroup Tstgr on Tstgr.id = TTstgr.stategroup_id \
  left outer join public.patient_insurancepolicy Tpolis on Tpolis.id = Tvis.insurance_policy_id \
  left outer join public.reporting_servicegroup_baseservice TTrepbsgp on TTrepbsgp.baseservice_id = Tserv.id \
  left outer join public.reporting_servicegroup Trepbsgp on Trepbsgp.id = TTrepbsgp.servicegroup_id \
WHERE \
  TTvis.count is not null and TTvis.price is not null and \
  to_char(Tvis.created,'YYYY-MM-DD') BETWEEN '%s' and '%s'  \
  %s %s %s %s %s %s %s %s %s"
    
    bq_exists_uzi = u"\
  and exists (SELECT * \
FROM \
  public.reporting_servicegroup Tsg \
  join public.reporting_servicegroup_baseservice Tsg_Tbs on  Tsg_Tbs.servicegroup_id = Tsg.id \
Where \
 Tsg.name = '%s'\
 and Tsg_Tbs.baseservice_id = TTvis.service_id)" % (GROUP_SERVICE_UZI)

    bq_notexists_uzi = u"\
  and not exists (SELECT * \
FROM \
  public.reporting_servicegroup Tsg \
  join public.reporting_servicegroup_baseservice Tsg_Tbs on  Tsg_Tbs.servicegroup_id = Tsg.id \
Where \
 Tsg.name = '%s'\
 and Tsg_Tbs.baseservice_id = TTvis.service_id)"     % (GROUP_SERVICE_UZI)

    bq_exists_lab = u"\
  and exists (SELECT * \
FROM \
  public.reporting_servicegroup Tsg \
  join public.reporting_servicegroup_baseservice Tsg_Tbs on  Tsg_Tbs.servicegroup_id = Tsg.id \
Where \
 Tsg.name = '%s'\
 and Tsg_Tbs.baseservice_id = TTvis.service_id)" % (GROUP_SERVICE_LAB)

    bq_notexists_lab = u"\
  and not exists (SELECT * \
FROM \
  public.reporting_servicegroup Tsg \
  join public.reporting_servicegroup_baseservice Tsg_Tbs on  Tsg_Tbs.servicegroup_id = Tsg.id \
Where \
 Tsg.name = '%s'\
 and Tsg_Tbs.baseservice_id = TTvis.service_id)" % (GROUP_SERVICE_LAB)
    
    bq_exists_radio = u"\
  and exists (SELECT * \
FROM \
  public.reporting_servicegroup Tsg \
  join public.reporting_servicegroup_baseservice Tsg_Tbs on  Tsg_Tbs.servicegroup_id = Tsg.id \
Where \
 Tsg.name = '%s'\
 and Tsg_Tbs.baseservice_id = TTvis.service_id)" % (GROUP_SERVICE_RADIO)

    bq_notexists_radio = u"\
  and not exists (SELECT * \
FROM \
  public.reporting_servicegroup Tsg \
  join public.reporting_servicegroup_baseservice Tsg_Tbs on  Tsg_Tbs.servicegroup_id = Tsg.id \
Where \
 Tsg.name = '%s'\
 and Tsg_Tbs.baseservice_id = TTvis.service_id)" % (GROUP_SERVICE_RADIO)
    
    def __init__(self, request):
        """
        """
        self.request = request
        self.params = dict(self.request.GET.items())
        self.trim_params = dict(filter(lambda x: x[1] is not u'',self.params.items()))

    def fmap(self,l):
        return map(lambda x: [x[0],x[1:]],l)  
    
    def sort(self,d):
        keys = d.keys()
        keys.sort()
        return [[item,d[item]] for item in keys]
    
    def dict(self,vl):
        d = {}
        for k, v in vl:
            d.setdefault(k, []).append(v)
        return d
    
    def struct(self,l):
        return self.sort(self.dict(self.fmap(l)))
    
    def struct_and_chkeys(self,l,d):
        fm = self.fmap(l)
        dv = self.dict(fm)
        dv = self.chkeys(dv,d)
        return(self.sort(dv))
    
    def chkeys(self,d1,d2):
        return dict((d2[key], value) for (key, value) in d1.items())
    
    def prep_query_str(self):    
        order__cls = ''
        if self.params['order__cls'] is not u'':
            order__cls = u"and Tvis.cls = '%s'"% (self.params['order__cls'])

        order__patient = ''
        if self.params['order__patient'] is not u'':
            order__patient = u"and Tvis.patient_id = '%s'"% (self.params['order__patient'])

        staff__staff = ''
        if self.params['staff__staff'] is not u'':
            staff__staff = u"and Tstaff.id = '%s'"% (self.params['staff__staff'])

        staff__department = ''
        if self.params['staff__department'] is not u'':
            staff__department = u"and Tdpr.id = '%s'"% (self.params['staff__department'])

        order__referral = ''
        if self.params['order__referral'] is not u'':
            order__referral = u"and Tvis.referral_id = '%s'"% (self.params['order__referral'])

        from_place_filial = ''
        if self.params['from_place_filial'] is not u'':
            from_place_filial = u"and Tvis.office_id = '%s'"% (self.params['from_place_filial'])

        execution_place_office = ''
        if self.params['execution_place_office'] is not u'':
            execution_place_office = u"and Tstgr.id = '%s'"% (self.params['execution_place_office'])
                        
        execution_place_filial = ''
        if self.params['execution_place_filial'] is not u'':
            execution_place_filial = u"and TTvis.execution_place_id = '%s'"% (self.params['execution_place_filial'])
            
        order__payment_type = ''
        if self.params['order__payment_type'] is not u'':
            order__payment_type = u"and Tvis.payment_type = '%s'"% (self.params['order__payment_type'])

        return self.query_str % (self.params['start_date']
                                ,self.params['end_date']
                                ,order__cls
                                ,order__patient
                                ,staff__staff
                                ,staff__department
                                ,order__referral
                                ,from_place_filial
                                ,execution_place_office
                                ,execution_place_filial
                                ,order__payment_type )      
    
