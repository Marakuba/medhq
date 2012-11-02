# -*- coding: utf-8 -*-
from tastypie.authorization import DjangoAuthorization
from api.resources import ExtResource
from tastypie.constants import ALL
from crm.models import AdSource
from tastypie.api import Api


class AdSourceResource(ExtResource):

    class Meta:
        queryset = AdSource.objects.all()
        resource_name = 'adsource'
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'id': ALL,
            'name': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='crm')

api.register(AdSourceResource())
