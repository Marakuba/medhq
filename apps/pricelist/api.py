# -*- coding: utf-8 -*-

from tastypie.resources import ModelResource
from tastypie.constants import ALL
from tastypie.api import Api
from pricelist.models import Discount


class DiscountResource(ModelResource):

    def dehydrate(self, bundle):
        bundle.data['name'] = "%s, %s" % (bundle.obj.name, bundle.obj.value)
        return bundle

    class Meta:
        queryset = Discount.objects.exclude(type=u'arc')
        resource_name = 'discount'
        limit = 100
        filtering = {
            'id': ALL,
            'name': ('istartswith',)
        }
        list_allowed_methods = ['get', 'post', 'put']

api = Api(api_name='pricelist')

api.register(DiscountResource())
