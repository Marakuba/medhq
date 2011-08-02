# -*- coding: utf-8 -*-
from tastypie.api import Api
from contrib.ext.resources import ExtResource
from tastypie.authorization import DjangoAuthorization
from interlayer.models import ClientItem
from tastypie.constants import ALL_WITH_RELATIONS

class ClientItemResource(ExtResource):

    def dehydrate(self, bundle):
        bundle.data['client_name'] = bundle.obj.client.name
        return bundle
    
    class Meta:
        queryset = ClientItem.objects.all()
        resource_name = 'clientitem'
        authorization = DjangoAuthorization()
        filtering = {
            'client' : ALL_WITH_RELATIONS,
        }
        
api = Api(api_name = 'interlayer')
api.register(ClientItemResource())
