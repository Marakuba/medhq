# -*- coding: utf-8 -*-
from django.utils.encoding import smart_str
import datetime
from visit.settings import PAYMENT_TYPES
from django.conf import settings
from django.db import connection
from amqplib.client_0_8.method_framing import defaultdict
from operator import itemgetter
from reporting.models import Report as Config
#from models import GROUP_SERVICE_UZI, GROUP_SERVICE_LAB

try:
    GROUP_SERVICE_UZI = settings.GROUP_SERVICE_UZI
    GROUP_SERVICE_LAB = settings.GROUP_SERVICE_LAB
    GROUP_SERVICE_RADIO = settings.GROUP_SERVICE_RADIO
except:
    raise Exception, u"Нет настроек групп услуг"

class Report():
    """
    """
    query_str = u''
    verbose_name = u''
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
  %s %s %s %s %s %s %s %s %s %s"
    
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
    
    def __init__(self, request,slug):
        """
        """
        self.request = request
        self.params = dict(self.request.GET.items())
        try:
            self.config = Config.objects.get(slug = slug)
            
            self.query_str = self.config.sql_query.sql
        except:
            print 'Report not found'
        self.trim_params = dict(filter(lambda x: x[1] is not u'',self.params.items()))
        self.results = self.prep_data()
    
    def prep_data(self):
        cursor = connection.cursor()
        cursor.execute(self.prep_query_str())
        results = cursor.fetchall()
        cursor.close ()
        return results

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

        from_lab = ''
        if self.params['from_lab'] is not u'':
            from_lab = u"and Tvis.source_lab_id = '%s'"% (self.params['from_lab'])

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
                                ,from_lab
                                ,execution_place_office
                                ,execution_place_filial
                                ,order__payment_type
                                )   
    def make(self):
        field_list = map(lambda x:x['name'] if isinstance(x,dict) else x,self.fields)
        dict_result = [dict(zip(field_list,record)) for record in self.results]
        group_list = map(lambda x:x['name'] if isinstance(x,dict) else x,self.groups)
        sorted(dict_result, key=itemgetter(*group_list))
        root_node = RootNode(dict_result)
        total_aggrs = isinstance(self.totals,dict) and self.totals['aggr'] or []
        totals_data = [aggr for aggr in total_aggrs if aggr['scope']=='data']
        totals_group = [aggr for aggr in total_aggrs if aggr['scope']=='group']
        for aggr in totals_data:
            root_node.do_aggr_func(aggr)
        root_node.groups = self.make_groups(root_node.data,self.groups,self.totals)
        for aggr in totals_group:
            root_node.do_aggr_func(aggr)
        return root_node
    
    def make_groups(self,data,groups,totals=[]):
        if not len(groups):
            return []
        curr_group = groups[0]
        field_name = isinstance(curr_group,dict) and curr_group['name'] or curr_group
#        print field_name
        group_items = []
        gr = defaultdict(list)
        while len(data):
            rec = data.pop()
            gr[rec[field_name]].append(rec)
        for key in gr.keys():
            node = Node(key,gr[key])
            node.value = field_name
            aggrs = isinstance(curr_group,dict) and curr_group['aggr'] or []
            aggrs_data = [aggr for aggr in aggrs if aggr['scope']=='data']
            aggrs_group = [aggr for aggr in aggrs if aggr['scope']=='group']
            
            for aggr in aggrs_data:
                node.do_aggr_func(aggr)
                
            node.groups = self.make_groups(node.data,groups[1:])
            
            for aggr in aggrs_group:
                node.do_aggr_func(aggr)
            group_items.append(node)
        return group_items
    
      
import pdb  
def sum_field(node,field,name,scope='group'):
    """
    """
#    print node.aggr_val
#    print node.groups
#    if node.aggr_val.has_key(name):
#        return node.aggr_val[name]
    if node.data:
        s = sum(map(lambda v:v[field] if v.has_key(field) and  v[field] else 0,node.data))
    else:
        s = sum([sum_field(gr,field,name,scope) for gr in node.groups])
    aggr_val = node.aggr_val.copy()
    aggr_val[name] = s
    node.aggr_val = aggr_val
    
    return s   

def min_field(node,field,name,scope='group'):
    """
    """
#    if node.aggr_val.has_key(name):
#        return node.aggr_val[name]
    if node.data:
        s = min(map(lambda v:v[field] if v.has_key(field) and  v[field] else 0,node.data))
    else:
        s = min([min_field(gr,field,name,scope) for gr in node.groups])
    aggr_val = node.aggr_val.copy()
    aggr_val[name] = s
    node.aggr_val = aggr_val
    
    return s 

def max_field(node,field,name,scope='group'):
    """
    """
    if node.data:
        s = max(map(lambda v:v[field] if v.has_key(field) and  v[field] else 0,node.data))
    else:
        s = max([max_field(gr,field,name,scope) for gr in node.groups])
    aggr_val = node.aggr_val.copy()
    aggr_val[name] = s
    node.aggr_val = aggr_val
    
    return s 
    
def count_field(node,field,name,scope='group'):
    """
    """
    if node.data:
        s = len(node.data)
    else:
        s = sum([count_field(gr,field,name,scope) for gr in node.groups])
    aggr_val = node.aggr_val.copy()
    aggr_val[name] = s
    node.aggr_val = aggr_val
    
    return s 
class Node():
    data = []
    groups = []
    name = u''
    value = u''
    aggr_fn = {
             'sum':sum_field,
             'min':min_field,
             'max':max_field,
             'count':count_field,
             
             }
    aggr_val = {}
    
    def __init__(self,name, data):
        self.data = data
        self.name = name
        
        
                
    def do_aggr_func(self,aggr):
        if self.aggr_fn.has_key(aggr['func']):
            return self.aggr_fn[aggr['func']](self,aggr['field'],aggr['name'])
                
class RootNode(Node):
    
    totals = {
        'verbose':u'ИТОГО:',
        'aggr':[]
    }
    
    def __init__(self,data):
        self.data = data
        self.name = 'rootNode'
                