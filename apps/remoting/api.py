# -*- coding: utf-8 -*-

from tastypie.resources import ModelResource
from tastypie.api import Api
from tastypie import fields
from remoting.models import RemoteState
from tastypie.constants import ALL


class RemoteStateResource(ModelResource):

    state = fields.ForeignKey('apps.api.registry.StateResource', 'state')

    class Meta:
        queryset = RemoteState.objects.all()
        resource_name = 'remotestate'
        filtering = {
            'id': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']

api = Api(api_name='remoting')

api.register(RemoteStateResource())
