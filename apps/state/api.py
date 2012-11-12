# -*- coding: utf-8 -*-

from tastypie.resources import ModelResource
from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie import fields
from tastypie.api import Api
from apiutils.resources import ExtResource
from state.models import State, Department
from constance import config
from tastypie.cache import SimpleCache


class LabResource(ModelResource):

    class Meta:
        queryset = State.objects.select_related().filter(type__in=('m', 'b', 'p')).\
                    exclude(id=config.MAIN_STATE_ID)
        resource_name = 'lab'
        limit = 10
        filtering = {
            'id': ALL,
            'name': ('istartswith',)
        }
        list_allowed_methods = ['get', 'post', 'put']


class MedStateResource(ModelResource):

    class Meta:
        queryset = State.objects.select_related().filter(type__in=('m', 'b', 'p')).order_by('type', 'id',)
        caching = SimpleCache()
        resource_name = 'medstate'
        limit = 20
        filtering = {
            'id': ALL,
            'name': ('istartswith',)
        }
        list_allowed_methods = ['get', 'post', 'put']


class OwnStateResource(ModelResource):

    class Meta:
        queryset = State.objects.select_related().filter(type__in=('b', 'p')).order_by('id',)
        caching = SimpleCache()
        resource_name = 'ownstate'
        limit = 20
        filtering = {
            'id': ALL,
            'name': ('istartswith',)
        }
        list_allowed_methods = ['get', 'post', 'put']


class StateResource(ModelResource):

    remotestate = fields.OneToOneField('remoting.api.RemoteStateResource', 'remotestate', null=True)

    class Meta:
        queryset = State.objects.all()
        resource_name = 'state'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 50
        filtering = {
            'id': ALL,
            'type': ALL,
            'name': ALL,
            'uuid': ALL,
            'remotestate': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class GenericStateResource(ExtResource):

    class Meta:
        queryset = State.objects.all()
        resource_name = 'genericstate'
        authorizaion = DjangoAuthorization()
        always_return_data = True
        limit = 50
        filtering = {
            'id': ALL,
            'type': ALL,
            'name': ALL,
            'uuid': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class InsuranceStateResource(ExtResource):

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['type'] = u'i'
        kwargs['print_name'] = bundle.data['name']
        kwargs['official_title'] = bundle.data['name']
        result = super(InsuranceStateResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    class Meta:
        queryset = State.objects.filter(type='i')
        resource_name = 'insurance_state'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 50
        filtering = {
            'name': ('istartswith',)
        }
        list_allowed_methods = ['get', 'post', 'put']


class DepartmentResource(ExtResource):
    """
    """
    state = fields.ToOneField(StateResource, 'state')

    def dehydrate(self, bundle):
        bundle.data['title'] = bundle.obj.__unicode__()
        return bundle

    class Meta:
        queryset = Department.objects.all()
        resource_name = 'department'
        limit = 100
        filtering = {
            'id': ALL,
            'name': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']

api = Api(api_name='state')

api.register(StateResource())
api.register(GenericStateResource())
api.register(DepartmentResource())
api.register(MedStateResource())
api.register(OwnStateResource())
api.register(InsuranceStateResource())
api.register(LabResource())
