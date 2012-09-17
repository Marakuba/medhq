# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
import csv
from service.models import BaseService, ExtendedService
from state.models import State
from pricelist.models import Price
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
import datetime
from optparse import make_option
from lab.models import Analysis

class Command(BaseCommand):

    option_list = BaseCommand.option_list + (
        make_option('--makelab', action='store_true', dest='makelab',
            help=u'Автоматическое создание тестов'),
#        make_option('--format', action='store', dest='format',
#            default='medhqjson', help=u'Формат файла'),
    )


    def handle(self, *args, **options):
        """
        """
        
        f = args[0]
        table = csv.reader(open(f,'r'), delimiter=",")
        
        header = table.next()
        
        _service_cache = {}
        _state_cache = {}
        
        for i,row in enumerate(table):
            cur_row = u'%s: ' % str(i+2)
            cols = [unicode(col.strip(),'utf-8') for col in row]
            # service_id, ext_id, group_id, group_name, name, short_name, state, activity, next - prices
            service_id, ext_id, group_id, group_name, name, short_name, state, branches, activity, service_type = cols[0:10]
            if name=='' and short_name=='':
                continue
            
            params = {
                'name':name,
                'short_name':short_name
            }
            
            if group_id:
                if group_id!='.':
                    group_object = _service_cache.get("service_%s" % group_id, None)
                    if not group_object:
                        try:
                            group_object = BaseService.objects.get(id=group_id)
                        except:
                            print u"Cannot find group %s" % group_name
    #                        if group_name:
    #                            group_object, created = BaseService.objects.get_or_create(name=group_name)
                        _service_cache["service_%s" % group_id] = group_object
                    params['parent'] = group_object
            else:
                if not state:
                    print cur_row, u"Group %s/%s has no ID" % (group_name, name) 
                    try:
                        if group_name!='.':
                            parent = BaseService.objects.get(name=group_name)
                        else:
                            parent = None
                        group_object, created = BaseService.objects.get_or_create(parent=parent,
                                                                                  name=name,
                                                                                  type=u'group')
                        _service_cache[u"service_%s" % group_object.name] = group_object
                        params['parent'] = group_object
                    except MultipleObjectsReturned:
                        print "\tThere are too many groups with name '%s'" % group_name
                    except ObjectDoesNotExist:
                        print "\tParent group '%s' does not exist" % group_name
                    except Exception, err:
                        print "\tError:", err
                else:
                    if _service_cache.has_key(u"service_%s" % group_name):
                        group_object = _service_cache[u"service_%s" % group_name]
                        params['parent'] = group_object
            
            if state:
                # это услуга
                state_object = _state_cache.get(state, None)
                if not state_object:
                    try: 
                        state_object = State.objects.get(name=state)
                    except:
                        state_object, created = State.objects.get_or_create(name=state, print_name=state, official_title=state, type=u'm')
                        if created:
                            print "State %s created"
                    _state_cache[state] = state_object
                    
                
                if ext_id:
                    ext_object = _service_cache.get("ext_%s" % ext_id, None)
                    if not ext_object:
                        try:
                            ext_object = ExtendedService.objects.get(id=ext_id)
                        except:
                            print "ExtService %s not found" % ext_id 
                        _service_cache["ext_%s" % ext_id] = ext_object
                    base_service = ext_object.base_service
                else:
                    params['type'] = service_type or u'cons'
                    base_service, created = BaseService.objects.get_or_create(**params)
                    print cur_row, u"BaseService %s/%s created" % ('parent' in params and params['parent'] or u'.',name)
                    ext_object, created = ExtendedService.objects.get_or_create(base_service=base_service,
                                                                       state=state_object)
#                    print cur_row, u"ExtendedService %s for %s created" % (name, state_object)
                    if branches:
                        branches = branches.split(',')
                        for branch in branches:
                            if branch not in _state_cache:
                                _state_cache[branch] = State.objects.get(name=branch)
                            branch = _state_cache[branch]
                            ext_object.branches.add(branch)
                
                if options.get('makelab'):
                    Analysis.objects.create(service=base_service, name=base_service.name)
                
                if len(cols)>10:
                    for idx in range(10,len(cols)):
                        price_col = cols[idx]
                        h = header[idx]
                        price_type,payment_type,payer,on_date = h.split('_')
                        
                        try:
                            on_date = datetime.datetime.strptime(on_date,"%d.%m.%Y")
                            if payer!='*':
                                payer = State.objects.get(name=payer)
                            else:
                                payer = None
                            Price.objects.create(extended_service=ext_object,
                                                 payment_type=payment_type, 
                                                 on_date=on_date,
                                                 price_type=price_type,
                                                 payer=payer,
                                                 value=price_col.replace(",","."))
                        except Exception,err:
                            print err, h
                
                ext_object.active = activity=='+'
                ext_object.save()
            else:
                pass
                # это группа

