# -*- coding: utf-8 -*-

from api.resources import ExtResource
from service.models import BaseService
from tastypie.authorization import DjangoAuthorization
from tastypie.api import Api
from api import get_api_name
from tastypie.exceptions import NotFound
from tastypie.constants import ALL
from django.shortcuts import get_object_or_404

def children(parent_id=None):
    """
    """
    nodes = []

    def tree_iterate(qs):
        for item in qs.filter(is_active=True).order_by(BaseService._meta.tree_id_attr, "-"+BaseService._meta.left_attr): #@UndefinedVariable
            nodes.append(item.id)
            if not item.is_leaf_node():
                tree_iterate(item.get_children())

    if parent_id:
        service = get_object_or_404(BaseService, id=parent_id)
        nodes.append(service.id)
        children = service.get_children()
    else:
        children = BaseService.tree.root_nodes()
    if children:
        tree_iterate(children)
    
    return nodes

class BaseServiceResource(ExtResource):
    def obj_get_list(self, request=None, **kwargs):
        """
        A ORM-specific implementation of ``obj_get_list``.
        
        Takes an optional ``request`` object, whose ``GET`` dictionary can be
        used to narrow the query.
        """
        filters = {}
        
        if hasattr(request, 'GET'):
            # Grab a mutable copy.
            filters = request.GET.copy()
        
        # Update with the provided kwargs.
        filters.update(kwargs)
        applicable_filters = self.build_filters(filters=filters)

        if filters.has_key('parent_id'):
            id_list = children(filters['parent_id'])
            print id_list
            try:
                return self.get_object_list(request).filter(id__in=id_list)
            except ValueError, e:
                raise NotFound("Invalid resource lookup data provided (mismatched type).")
        else:
            try:
                return self.get_object_list(request).filter(**applicable_filters)
            except ValueError, e:
                raise NotFound("Invalid resource lookup data provided (mismatched type).")

    class Meta:
        queryset = BaseService.objects.all() 
        limit = 1000
        resource_name = 'baseservice'
        authorization = DjangoAuthorization()
        filter = {
            'parent_id':ALL
        }
        

api = Api(api_name=get_api_name('services'))
api.register(BaseServiceResource())
