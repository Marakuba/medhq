# -*- coding: utf-8 -*-
from helpdesk.models import Issue, IssueType
from tastypie.authorization import DjangoAuthorization
from apiutils.resources import ExtResource
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie.api import Api
from tastypie import fields


class IssueTypeResource(ExtResource):

    class Meta:
        queryset = IssueType.objects.all()
        resource_name = 'issuetype'
        limit = 100
        authorization = DjangoAuthorization()
        filtering = {
            'name': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class IssueResource(ExtResource):

    type = fields.ForeignKey(IssueTypeResource, 'type')

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        result = super(IssueResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    def dehydrate(self, bundle):
        bundle.data['type_name'] = bundle.obj.type
        bundle.data['level_name'] = bundle.obj.get_level_display()
        bundle.data['status_name'] = bundle.obj.get_status_display()
        bundle.data['operator_name'] = bundle.obj.operator
        return bundle

    class Meta:
        queryset = Issue.objects.all()
        resource_name = 'issue'
        limit = 100
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'type': ALL_WITH_RELATIONS,
            'level': ALL,
            'status': ALL,
            'operator': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='examination')

api.register(IssueTypeResource())
api.register(IssueResource())
