# -*- coding: utf-8 -*-

from django.http import HttpResponse
from django.views.generic.list_detail import object_list
from django.db.models.query_utils import Q
from django.shortcuts import get_object_or_404
from mptt.models import MPTTModel


def as_list(request, queryset, extra_context, extra=None):
    
    return (queryset, extra_context)

def as_tree(request, queryset, extra_context, extra=None):
    filter = Q()
    if 'node' in request.GET:
        node = get_object_or_404(queryset.model, pk=request.GET.get('node'))
        extra_context['node'] = node
        filter |= Q(parent=node)
    else:
#        if 'level' in extra:
        if hasattr(queryset.model, 'tree'):
            filter |= Q(parent__isnull=True)
        else:
            filter = Q(level=extra['level'])
    queryset = queryset.filter(filter)
    return (queryset, extra_context)


class Selection(object):
    
    types = {'list':as_list,'tree':as_tree}
    
    def __init__(self):
        self.settings = dict()
        
    def __call__(self, request, slc_name):
        if not self.settings.get(slc_name):
            return self.not_found(slc_name)
               
        qs, type, verbose_name, paginate_by, extra, template_name = self.settings[slc_name]
        
        if type not in self.types:
            return self.error(type)
        
        if not template_name:
            template_name = "selection/%s.html" % type

        extra_context = {'verbose_name':verbose_name,'slc':slc_name}
        
        qs,extra_context = self.func(type, request, qs, extra_context, extra)
        
        page = request.GET.get('page',0)
        return object_list(request, qs, paginate_by=paginate_by, page=page, extra_context=extra_context, template_name=template_name)
    
    def func(self, type, *args, **kwargs):
        f = self.types[type]
        return f(*args, **kwargs)
    
    def register(self, id, queryset, type, verbose_name=None, paginate_by=10, extra=None, template_name=None):
        self.settings[id] = (queryset, type, verbose_name, paginate_by, extra, template_name)
    
    def reverse_label(self, ac_name, key_value):
        key = 'pk'
        qs, type, verbose_name, paginate_by, extra, template_name = self.settings[ac_name]
        try:
            result = qs.get(**{key:key_value})
        except qs.model.DoesNotExist:
            return key_value
        return result

    def not_found(self, slc_name):
        return HttpResponse(status=404)

    def error(self, type):
        return HttpResponse("error type: %s" % type, status=500)



selection = Selection()
