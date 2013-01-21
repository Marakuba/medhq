# -*- coding: utf-8 -*-

import time
import re
import datetime

def smartFilter(request,prefix=''):
    if prefix:
        prefix+='__'
    req_args = request.split(' ')
    accept_args = {}
    #удаляем пустые элементы
    while req_args.count(''):
        req_args.remove('')
    #если параметр не один, значит возможно среди них есть дата
    date_arg = None
    p = re.compile('\d{2}(-|/|\.)?\d{2}(-|/|\.)?\d{4}$')
    formats = ['%d.%m.%Y','%d/%m/%Y','%d-%m-%Y','%d%m%Y',]
    params = ['last_name__istartswith','first_name__istartswith','mid_name__istartswith']
    if req_args:
        d = req_args[-1]
        if p.match(d):
            req_args.pop()
            for f in formats:
                try: 
                    date_arg = time.strptime(d, f)
                    date_arg = datetime.date(year=date_arg.tm_year,month=date_arg.tm_mon,day=date_arg.tm_mday)
                    break
                except Exception, err:
                    # print err
                    pass
    #если последний элемент строки - дата
    if date_arg:
        accept_args[prefix+'birth_day'] = date_arg
    if len(req_args) > 3:
        req_args = req_args[:3]
    for i,arg in enumerate(req_args):
        accept_args[prefix+params[i]] = arg
    return accept_args