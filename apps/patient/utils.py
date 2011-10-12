# -*- coding: utf-8 -*-

import time
import re
import datetime

def smartFilter(request,prefix=''):
    if prefix:
        prefix+='__'
    args = request.split(' ')
    accept_args = {}
    #удаляем пустые элементы
    while args.count(''):
        args.remove('')
    #если параметр не один, значит возможно среди них есть дата
    date_arg = None
    p = re.compile('\d{2}(-|/|\.)?\d{2}(-|/|\.)?\d{4}$')
    formats = ['%d.%m.%Y','%d/%m/%Y','%d-%m-%Y','%d%m%Y',]
    params = ['last_name__istartswith','first_name__istartswith','mid_name__istartswith']
    if len(args) > 1:
        d = args[-1]
        if p.match(d):
            args.pop()
            for f in formats:
                try: 
                    date_arg = time.strptime(d, f)
                    date_arg = datetime.datetime.fromtimestamp(time.mktime(date_arg))
                    break
                except:
                    pass
    #если последний элемент строки - дата
    if date_arg:
        accept_args[prefix+'birth_day'] = date_arg
    if len(args) > 3:
        args = args[:3]
    for i,arg in enumerate(args):
        accept_args[prefix+params[i]] = arg
    return accept_args