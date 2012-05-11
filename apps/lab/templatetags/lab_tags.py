# -*- coding: utf-8 -*-

from django import template
from django.template.defaultfilters import stringfilter
import re

register = template.Library()

@stringfilter
def sup(result):
    ptn = re.compile('\^(\d+)', re.MULTILINE)
    rpl = u'<sup>\\1</sup>'
    result = ptn.sub(rpl, result)
    return result 

register.filter("sup", sup)

def zid(value, num):
    return value and str(value).zfill(int(num)) or None 

register.filter("zid", zid)

