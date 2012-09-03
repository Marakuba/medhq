# -*- coding: utf-8 -*-

"""
"""

from lab.widgets import register, BaseWidget
from service.models import BaseService
#from lab.models import Result

class BasePlain(BaseWidget):
    """
    """
    verbose_name = u'Базовый построчный'
    
    def get_template(self):
        return "print/lab/widgets/baseplain.html"
    
    def make_results(self, lab_order):
        result_qs = lab_order.result_set.active().filter(order=lab_order, to_print=True).order_by('analysis__service__%s' % BaseService._meta.tree_id_attr, 
                    '-analysis__service__%s' % BaseService._meta.left_attr,
                    'analysis__order')
        
        cur_service = None
        cur_group = None
        result_list = []
        set_len = 0
        for result in result_qs:
            if cur_service != result.analysis.service:
                if set_len>1:
                    result_list.append({'class':'blank','object':cur_service.gen_ref_interval or ' '})
                cur_service = result.analysis.service
                set_len = cur_service.analysis_set.all().count()
                group = cur_service.parent#", ".join([node.__unicode__() for node in cur_service.get_ancestors()]) 
                if cur_group != group:
                    cur_group = group
                    result_list.append({'class':'group','object':cur_group}) 
                if set_len>1:
                    result_list.append({'class':'service','object':cur_service.__unicode__()})
            
            cls = result.is_completed() and 'result' or 'progress'
            if result.is_group():
                cls = 'subgroup'
            result_list.append({'class':cls,'object':result})
                
        if set_len>1:
            result_list.append({'class':'blank','object':cur_service.gen_ref_interval or ' '})
        
        return { 'results' : result_list }
    
from collections import defaultdict, OrderedDict

class BaseColumn(BaseWidget):
    """
    Требуется строгий порядок сортировки тестов
    """
    title_delimiter = "::"
    code_delimiter = "_"
    verbose_name = u'Базовый колоночный'

    def process_results(self, results):
        return results
    
    def get_template(self):
        return "print/lab/widgets/basecolumn.html"
    
    def make_results(self, lab_order):
        result_qs = lab_order.result_set.active().filter(order=lab_order, to_print=True) \
            .order_by('analysis__service__%s' % BaseService._meta.tree_id_attr, 
            '-analysis__service__%s' % BaseService._meta.left_attr,
            'analysis__order')
        results = OrderedDict()
        cols = [u'Наименование показателя',]
        service = None
        for r in result_qs:
            service = r.analysis.service
            name, col = r.analysis.name.split(self.title_delimiter)
            if col not in cols:
                cols.append(col)
            if name not in results:
                results[name] = []
            results[name].append(r.value)
        
        result_list = []
        
        for k in results:
            row = [k,]
            row.extend(results[k])
            result_list.append(row)
        
        return { 'cols':cols, 'results':result_list, 'service':service }
        