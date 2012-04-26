# -*- coding: utf-8 -*-

from django import template
from django.template.defaultfilters import stringfilter

register = template.Library()

@stringfilter
def sup(result):
    if "^" in result:
        parts = result.split("^")
        parts[-1] = u"<sup>%s</sup>" % parts[-1]
        return "".join(parts)
    return result 

register.filter("sup", sup)

def zid(value, num):
    return value and str(value).zfill(int(num)) or None 

register.filter("zid", zid)

