# -*- coding: utf-8 -*-


from tastypie.api import Api
from tastypie import fields
from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL_WITH_RELATIONS, ALL

from apiutils.resources import ExtResource
from .models import Calculation, CalculationItem


class CalculationResource(ExtResource):

    def dehydrate(self, bundle):
        bundle.data['amount'] = bundle.obj.get_amount()
        bundle.data['category_name'] = bundle.obj.get_category_display()
        return bundle

    class Meta:
        queryset = Calculation.objects.all()
        resource_name = 'calculation'
        authorization = DjangoAuthorization()
        always_return_data = True
        list_allowed_methods = ['get', 'post', 'put']
        filtering = {
            'id': ALL,
        }


class CalculationItemResource(ExtResource):

    class Meta:
        queryset = CalculationItem.objects.all()
        resource_name = 'calculationitem'
        authorization = DjangoAuthorization()
        always_return_data = True
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='bonus')

api.register(CalculationResource())
api.register(CalculationItemResource())
