# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
from optparse import make_option
from state.models import State
from service.models import BaseService, ExtendedService
from django.db.models.query_utils import Q
from django.utils import simplejson
from service.utils import revert_tree_objects
from lab.models import LabService, Tube, InputList, Measurement, Analysis

class Command(BaseCommand):
    help = u'Загружает дерево услуг.'
    args = "FILENAME"

    option_list = BaseCommand.option_list + (
        make_option('--root', action='store', dest='root',
            default=None, help=u'Определяет узел, в который будут добавляться услуги'),
        make_option('--format', action='store', dest='format',
            default='medhqjson', help=u'Формат файла'),
        make_option('--branches', action='store', dest='branches',
            help=u'Определяет узел, в который будут добавляться услуги'),
        make_option('--state', action='store', dest='state',
            help=u'Определяет узел, в который будут добавляться услуги'),
        make_option('--top', action='store', dest='top',
            help=u'Определяет узел, в который будут добавляться услуги'),
    )

    def handle(self, *files, **options):
        """
        """
        self.format = options.get('format')
        self.root = options.get('root')
        if self.root:
            try:
                self.root = unicode(self.root,'utf8')
                self.root = BaseService.objects.get(Q(name=self.root) | Q(code=self.root))
            except:
                self.stderr.write(self.style.ERROR("Node pointed as root not found. Using Default Root.\n"))
        
        self.branches = options.get('branches')
        if not self.branches:
            self.stderr.write(self.style.ERROR("Branches option is required\n"))
            return
        self.branches = list(State.objects.filter(name__in=self.branches.split(',')))
        if not len(self.branches):
            self.stderr.write(self.style.ERROR("Branches not found\n"))
            return

        self.state = options.get('state')
        if not self.state:
            self.stderr.write(self.style.ERROR("State option is required\n"))
            return
        try:
            self.state = State.objects.get(name__iexact=self.state)
        except:
            self.stderr.write(self.style.ERROR("State not found\n"))
            return

        self.top = options.get('top')
        if self.top:
            self.top = unicode(self.top,'utf8')
            self.top, created = BaseService.objects.get_or_create(parent=self.root, 
                                                                  name=self.top, 
                                                                  short_name=self.top)
            self.root = self.top
        
        for f in files:
            self.load_data(f)
    
    def load_data(self, f):
        """
        """
        data_file = open(f)
        data = simplejson.loads("".join(data_file))
        if self.format=='medhqjson':
            for node in data:
                self.build_service(node, self.root)
            if self.root is not None:
                print "Reverting root node..."
                root = BaseService.objects.get(id=self.root.id)
                revert_tree_objects(root)
        else:
            pass
        print "Done."
        data_file.close()
        
    def make_indent(self, indent):
        
        return ( (indent-1)*"\t", indent*"\t" )
    
    def build_service(self, node, root=None, indent=1):
        service, created = BaseService.objects.get_or_create(parent=root,
                                                             name=node['name'],
                                                             short_name=node['short_name'],
                                                             code=node['code'],
                                                             execution_time=node['execution_time'],
                                                             gen_ref_interval=node['gen_ref_interval'],
                                                             is_group=node['is_group'])
        ti,di = self.make_indent(indent)
        print ti, service
        
        if node.has_key('lab_service'):
            ls = node['lab_service']
            try:
                lab_service = service.labservice
                lab_service.code = ls['code']
                lab_service.is_manual = ls['is_manual']
                lab_service.save()
            except:
                LabService.objects.create(base_service=service,
                                          is_manual=ls['is_manual'],
                                          code=ls['code'])
        
        if node.has_key('extended_service'):
            es_list = node['extended_service']
            for es in es_list:
                tube = None
                if es.has_key('tube') and es['tube']:
                    tube, created = Tube.objects.get_or_create(name=es['tube']['name'],bc_count=es['tube']['bc_count'])
                try:
                    extended_service, created = ExtendedService.objects.get_or_create(base_service=service,
                                                                                      state=self.state,
                                                                                      tube=tube,
                                                                                      tube_count=es['tube_count'],
                                                                                      is_manual=es['is_manual'])
                except Exception, err:
                    print "error:",err
                    print es_list
                    return
                    
                if self.branches:
                    extended_service.branches.add(*self.branches)
        
        if node.has_key('analysis'):
            anl_list = node['analysis']
            for anl in anl_list:
                il_cache = []
                if anl.has_key('input_list'):
                    for il in anl['input_list']:
                        obj, created = InputList.objects.get_or_create(name=il)
                        il_cache.append(obj)
                
                measurement = None
                if anl.has_key('measurement') and anl['measurement']:
                    measurement, created = Measurement.objects.get_or_create(name=anl['measurement'])
                
                analysis, created = Analysis.objects.get_or_create(service=service,
                                                          name=anl['name'],
                                                          code=anl['code'],
                                                          measurement=measurement,
                                                          ref_range_text=anl['ref_range_text'],
                                                          order=anl['order'])
                if len(il_cache):
                    analysis.input_list.add(*il_cache)
        
        if node.has_key('children'):
            for child in node['children']:
                self.build_service(child, service, indent+1)
    
