# -*- coding: utf-8 -*-
from tastypie.api import Api
from apiutils.resources import ExtResource
from tastypie.authorization import DjangoAuthorization
from interlayer.models import ClientItem
from tastypie.constants import ALL_WITH_RELATIONS
from tastypie import fields


class ClientItemResource(ExtResource):
    client = fields.OneToOneField('patient.api.PatientResource', 'client')

    def dehydrate(self, bundle):
        bundle.data['client_name'] = bundle.obj.client.full_name()
        return bundle

    class Meta:
        queryset = ClientItem.objects.all()
        resource_name = 'clientitem'
        authorization = DjangoAuthorization()
        filtering = {
            'client': ALL_WITH_RELATIONS,
        }
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='interlayer')

api.register(ClientItemResource())
