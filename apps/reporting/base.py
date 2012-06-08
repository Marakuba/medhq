# -*- coding: utf-8 -*-
from django.utils.encoding import smart_str
import datetime
from visit.settings import PAYMENT_TYPES
from django.conf import settings
from django.db import connection
from amqplib.client_0_8.method_framing import defaultdict
from operator import itemgetter
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
    
    def __init__(self,request, sql_query):
        """
        """
        self.request = request
        self.results = sql_query
        
    
    def convert_results(self,field_list):
        """
        field_list - массив словарей с настройками полей
        обязательный ключ словаря - name
        """
        list_result = []
        for record in self.results:
            data_item = DataItem()
            for ind, item in enumerate(record):
                setattr(data_item,field_list[ind]['name'],item)
            list_result.append(data_item)
        return list_result
    
    def fdict(self,fields):
        """return {'dsf': {'name': 'dsf'},
                'name': {'name': 'name'},
                'pt': {'name': 'pt', 'renderer': <function __main__.renderer>}}
        """        
        field_dict_list = map(lambda x:x if isinstance(x,dict) else {'name':x},fields)
        return dict([(field['name'],field) for field in field_dict_list])
    
    def make(self):
        self.dgroups = self.fdict(self.groups)
        self.dfields = self.fdict(self.fields)
        field_list = map(lambda x:x['name'] if isinstance(x,dict) else x,self.fields)
        dict_result = [dict(zip(field_list,record)) for record in self.results]
#        pdb.set_trace()
        list_results = map(lambda x: dict(map(lambda y: (y[0],self.dfields[y[0]]['renderer'](y[1],x) if self.dfields.has_key(y[0]) and self.dfields[y[0]].has_key('renderer') else y[1]),x.items())),dict_result)
        """list_results = [{'dsf': 'fdsf', 'name': 'sdf', 'pt': 'ggg'},
                          {'dsf': 'gfh', 'name': 'gfgd', 'pt': 'xxx'}]
        """
#        field_list = map(lambda x:x['name'] if isinstance(x,dict) else x,self.fields)
#        dict_result = [dict(zip(field_list,record)) for record in self.results]
#        self.results = map(lambda x:map(lambda y:self.fields[y]['renderer'](x[y],x) if isinstance(self.fields[y],dict) else x[y],x),dict_result)

        group_list = map(lambda x:x['name'] if isinstance(x,dict) else x,self.groups)
        self.results = sorted(list_results, key=itemgetter(*group_list))
        root_node = RootNode(list_results)
        
        total_aggrs = isinstance(self.totals,dict) and self.totals['aggr'] or []
        totals_data = [aggr for aggr in total_aggrs if aggr['scope']=='data']
        totals_group = [aggr for aggr in total_aggrs if aggr['scope']=='group']
        for aggr in totals_data:
            root_node.do_aggr_func(aggr)
        root_node.groups = self.make_groups(root_node.data,self.groups,self.totals)
        for aggr in totals_group:
            root_node.do_aggr_func(aggr)
#        pdb.set_trace()
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
            node = Node(field_name,key,gr[key])
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
    
    def as_list(self,node):
        
        def set_params(dest,config):
            """
            добавляет в словарь dest параметры с именами из param_names, присутствующие в config
            """
            param_names = ['colspan','cssCls']
            dest.update(dict(map(lambda x:(x,config[x]) if x in config.keys() else (None,None),param_names)))
            if dest.has_key(None):
                dest.pop(None)
            return dest
                
        def get_aggrs(aggr_val,group_config):
            """
            формирует массив со словарями значений группировок с указанными настройками, такими как colspan
            """
            data = []
#            pdb.set_trace()
            for key in aggr_val.keys():
                item = {'value':aggr_val[key]}
                data.append(set_params(item,group_config[key]))
            return data
                
        total_list = []
        item_totals = {'type':'totals'}
        if isinstance(node,RootNode) and self.totals.has_key('aggr') and node.aggr_val.items():
            dtotals = self.fdict(self.totals['aggr'])
            totals_data = [set_params({'value':self.totals['verbose']},self.totals)]
            totals_data += get_aggrs(node.aggr_val,dtotals)
#            pdb.set_trace()
            item_totals['data'] = totals_data
            
            if not self.totals.has_key('position') or self.totals['position'] in  ('top','both'):
                total_list.append(item_totals)
        
        for record in node.data:
            rec = []
            rec += get_aggrs(record,self.dfields)
            item = {'type':'data',
                    'data':rec}
            total_list.append(item)
        
        for group in node.groups:
            data = [set_params({'value':group.value},self.dgroups)]
            if 'aggr' in self.dgroups.keys():
                daggrs = self.fdict(self.dgroups['aggr'])
                data += get_aggrs(group.aggr_val,daggrs)
            item = {'type':'group',
                    'name':group.name,
                    'data':data}
            total_list.append(item)
            total_list += self.as_list(group)
            
        if isinstance(node,RootNode) and self.totals.has_key('position') and self.totals['position'] in ('bottom','both'):
            total_list.append(item_totals)
        return total_list
                
      
import pdb  
def sum_field(node,field,name,scope='group'):
    """
    """
#    print node.aggr_val
#    print node.groups
#    if node.aggr_val.has_key(name):
#        return node.aggr_val[name]
    if node.data:
        s = sum(map(lambda v:v[field] if field in v and  v[field] else 0,node.data))
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
        s = min(map(lambda v:v[field] if field in v and  v[field] else 0,node.data))
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
        s = max(map(lambda v:v[field] if field in v and  v[field] else 0,node.data))
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

def choices_renderer(choices):
    """
        CHOICES: ( (0, 'value'), (1, 'value') .... )
    """
    d = dict(choices)
    
    def renderer(value, ctx):
        """
            value:    значение поля
            ctx:      целая строка данных
            
            из вышестоящей функции-декоратора передается словарь d.
            value будет одним из ключей данного словаря  
        """
        
        return d[value]
    
    return renderer

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
    
    def __init__(self,name, value, data):
        self.data = data
        self.name = name
        self.value = value
        
        
                
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
        
class DataItem():
    def __init__(self):
        pass
#    def __get__(self,instanse,owner):
#        pass
#                