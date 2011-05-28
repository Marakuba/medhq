# -*- coding: utf-8 -*-

from tastypie.resources import ModelResource
from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL, ALL_WITH_RELATIONS

from service.models import BaseService, BaseServiceGroup, LabServiceGroup,\
    ExecutionTypeGroup


class BaseServiceGroupResource(ModelResource):
    """
    """
    class Meta:
        queryset = BaseServiceGroup.objects.all()
        resource_name = 'baseservicegroup'
        authorization = DjangoAuthorization()
        filtering = {
        }
        
        
class LabServiceGroupResource(ModelResource):
    """
    """
    class Meta:
        queryset = LabServiceGroup.objects.all()
        resource_name = 'labservicegroup'
        authorization = DjangoAuthorization()
        filtering = {
        }
        
        
class ExecutionTypeGroupResource(ModelResource):
    """
    """
    class Meta:
        queryset = ExecutionTypeGroup.objects.all()
        resource_name = 'executiontypegroup'
        authorization = DjangoAuthorization()
        filtering = {
        }
        
        
class BaseServiceResource(ModelResource):
    """
    """
    class Meta:
        queryset = BaseService.objects.all()
        resource_name = 'baseservice'
        limit = 1000
        authorization = DjangoAuthorization()
        filtering = {
            'parent':ALL
        }