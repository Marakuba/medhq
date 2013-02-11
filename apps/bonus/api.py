# -*- coding: utf-8 -*-


from tastypie.api import Api
from tastypie import fields
from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL_WITH_RELATIONS, ALL

from apiutils.resources import ExtResource
from .models import Calculation, CalculationItem


class CalculationResource(ExtResource):

    class Meta:
        queryset = Calculation.objects.all()
        resource_name = 'calculation'
        authorization = DjangoAuthorization()
        list_allowed_methods = ['get', 'post', 'put']


class CalculationItemResource(ExtResource):

    class Meta:
        queryset = CalculationItem.objects.all()
        resource_name = 'calculationitem'
        authorization = DjangoAuthorization()
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='bonus')

api.register(CalculationResource())
api.register(CalculationItemResource())
