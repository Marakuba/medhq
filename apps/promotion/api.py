# -*- coding: utf-8 -*-

from tastypie.authorization import DjangoAuthorization
from tastypie.api import Api
from apiutils.resources import ExtResource
from promotion.models import Promotion
from tastypie import fields


class PromotionResource(ExtResource):
    discount = fields.ForeignKey('pricelist.api.DiscountResource', 'discount', null=True)

    class Meta:
        queryset = Promotion.objects.all().select_related()
        resource_name = 'promotion'
        authorization = DjangoAuthorization()
        filtering = {
        }
        list_allowed_methods = ['get', 'post', 'put']

api = Api(api_name='promotion')

api.register(PromotionResource())
