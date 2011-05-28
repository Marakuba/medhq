# -*- coding: utf-8 -*-

import re
import csv

from djboss.commands import *

from service.models import StandardService, BaseService
from state.models import State
from service.utils import unicode_csv_reader
from service.models import ExecutionPlace


@command
@argument('sql_file')
@argument('mclass')
def sql2csv(args):
    """
    """
    
    row_re = re.compile("INSERT INTO class_%s \(id, name, code, parent_id, parent_code, node_count, additional_info\) VALUES\((.*)\)" % args.mclass)
    
    f = open(args.sql_file,'r')
    rows = f.read().split('\n')
    rows.pop()
    
    for row in rows:
        m = row_re.match(row)
        if m:
            #id, name, code, parent_id, parent_code, node_count, additional_info = m.group(1).split(", ")
            v = m.group(1).replace('NULL','"NULL"').replace("'","\"").replace(", \"",",\"")
            print v
            
            #vals = m.group(1).split(", ")
            #if len(vals)!=7:
                #delta = len(vals)-7
                #print len(vals), m.group(1)
                #print "\t->",", ".join(vals[1:delta+2]),"\n"
            #print 'matched', m.group(1)

@command
@argument('csv_file')
@argument('prefix')
def loaddict(args):
    """
    """
    
    
    _cache = {}
    table = csv.reader(open(args.csv_file,'r'))
    for id, name, code, parent_id, parent_code, node_count, additional_info in table:
        code = args.prefix+code
        new_item = StandardService(name=name,code=code,description=additional_info)
        if parent_code!='NULL':
            parent_code = args.prefix+parent_code
            new_item.insert_at(_cache[parent_code], position='last-child', commit=False)
            #print _cache[parent_code]
        new_item.save()
        _cache[code] = new_item
        print code


from collections import defaultdict

@command
@argument('csv_file')
def catalog(args):
    """
    """
    
    table = csv.reader(open(args.csv_file,'r'), delimiter=",")
    
    
    states = (u"Евромед", u"КЛЦ", u"ДЦ")
    
    pl = [State.objects.get(name=state) for state in states]
    
    
    level = 1
    groups = None
    new_service = None
    
    for i,row in enumerate(table):
        l,name,short_name,em,klc,dc = [col.strip() for col in row]
        l = int(l)
        print i,l,name
        if l==1:
            groups = [None]
            level = 1
            
        if l!=level:
            if l>level:
                groups.append(new_service)
            elif l<level:
                groups.pop(-1)
            level = l

        new_service, created = BaseService.objects.get_or_create(name=name, short_name=short_name)
        new_service.parent = groups[level-1]
        new_service.version +=1
        #new_service.code
        new_service.save()
        
        for i, col in enumerate((em,klc,dc)):
            if col==u'0':
                ExecutionPlace.objects.create(state=pl[i], base_service=new_service, is_prefer=i==0)
            
