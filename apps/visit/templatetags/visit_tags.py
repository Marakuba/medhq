# -*- coding: utf-8 -*-

from django import template
from django.core.cache import cache
from service.models import BaseService
from django.utils import simplejson

register = template.Library()

@register.inclusion_tag("admin/visit/visit/includes/tree_list.html")
def tree_list(object_list, services=None):
    ids = None
    if services:
        ids = services.values_list('id', flat=True)
    return {'object_list':object_list,
            'ids':ids}

@register.simple_tag
def middle(forloop):
    diff = forloop['revcounter']-forloop['counter'] 
    if diff in (0,1):
        return "</td><td>"
    return ""




def get_service_list():
    """
    """
    def tree_iterate(qs):
        """
        """
        nodes = []
        for item in qs.filter(is_active=True).order_by(BaseService.tree.tree_id_attr, "-"+BaseService.tree.left_attr):
            node = {"id":item.id,
                    "text":item.short_name or item.name,
                    "name":item.name,
                    "leaf":True,
                    "level":item.level,
                    "places":[place for place in item.execution_place.all().order_by('id')]}
            if not item.is_leaf_node():
                node['children'] = tree_iterate(item.get_children())
                node['leaf'] = False
            nodes.append(node)
        return nodes
    
    _cached_tree = cache.get('service_list')
    if not _cached_tree:
        _cached_tree = simplejson.dumps(tree_iterate(BaseService.tree.root_nodes()))
        cache.set('service_list', _cached_tree, 60*60)
    
    return _cached_tree

def get_ancestors():
    """
    """
    def tree_iterate(qs):
        """
        """
        nodes = []
        for item in qs.filter(is_active=True).order_by(BaseService.tree.tree_id_attr, "-"+BaseService.tree.left_attr):
            node = {"id":item.id,
                    "text":item.short_name or item.name,
                    "name":item.name,
                    "leaf":True,
                    "count":0,
                    "level":item.level,
                    "places":[place.id for place in item.execution_place.all().order_by('id')]}
            if not item.is_leaf_node():
                children = tree_iterate(item.get_children())
                if children:
                    node['children'] = children 
                node['leaf'] = False
                nodes.append(node)
        return nodes
    _cached_tree = cache.get('ancestors_list')
    if not _cached_tree:
        _cached_tree = simplejson.dumps(tree_iterate(BaseService.tree.root_nodes()))
        cache.set('ancestors_list', _cached_tree, 60*60)
    
    return _cached_tree
    #return simplejson.dumps(tree_iterate(BaseService.tree.root_nodes()))


@register.inclusion_tag("admin/visit/visit/menu_json.html")
def menu_json():
    return {'json':get_ancestors()}


from collections import defaultdict

def get_nodes():
    """
    """
    _cached_nodes = cache.get('nodes_list')
    if not _cached_nodes:
        nodes = defaultdict(list)
        for item in BaseService.objects.actual().order_by(BaseService.tree.tree_id_attr, "-"+BaseService.tree.left_attr):
            if item.is_leaf_node():
                node = {
                    "id":item.id,
                    "parent":item.parent_id,
                    "text":item.short_name or item.name,
                    "name":item.name,
                    "selected":False,
                    "place":getattr(item.get_ex_place(),'id',None),
                    "places":[place.id for place in item.execution_place.all().order_by('id')],
                    "price":item.price(),
                }
                if item.staff:
                    node["staff"] = [(staff.id,staff.__unicode__()) for staff in item.staff.all()]
                nodes[item.parent_id].append(node)
        _cached_nodes = simplejson.dumps(nodes)
        cache.set('nodes_list', _cached_nodes, 60*60)
    
    return _cached_nodes
    #return simplejson.dumps(nodes)    

@register.inclusion_tag("admin/visit/visit/elements_json.html")
def elements_json():
    return {'json':get_nodes()}

class ServiceListNode(template.Node):
    def __init__(self, var_name):
        self.var_name = var_name
    def render(self, context):
        context[self.var_name] = get_service_list()
        return 

@register.tag
def make_service_list(parser, token):
    try:
        # Splitting by None == splitting by spaces.
        tag_name, arg = token.contents.split(None, 1)
    except ValueError:
        raise template.TemplateSyntaxError, "%r tag requires arguments" % token.contents.split()[0]
    try:
        cmd, var_name = arg.split(None)
    except ValueError:
        raise template.TemplateSyntaxError, "%r tag had invalid arguments" % tag_name
    return ServiceListNode(var_name)


