# -*- coding: utf-8 -*-

from tastypie.resources import ModelResource
from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie import fields
from tastypie.api import Api
from api.resources import ExtResource
from reporting.models import Report, Query
from django.db.models.query_utils import Q


class ReportTreeResource(ModelResource):

    parent = fields.ForeignKey('self', 'parent', null=True)

    def dehydrate(self, bundle):
        bundle.data['text'] = bundle.obj.name
        bundle.data['slug'] = bundle.obj.slug
        bundle.data['fields'] = bundle.obj.get_fields()
        bundle.data['parent'] = bundle.obj.parent and bundle.obj.parent.id
        if bundle.obj.is_leaf_node():
            bundle.data['leaf'] = bundle.obj.is_leaf_node()
        return bundle

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(ReportTreeResource, self).build_filters(filters)

        if "parent" in filters:
            if filters['parent'] == 'root':
                del orm_filters['parent__exact']
                orm_filters['parent__isnull'] = True

        return orm_filters

    def get_object_list(self, request):
        """
        An ORM-specific implementation of ``get_object_list``.

        Returns a queryset that may have been limited by other overrides.
        """
        qs = self._meta.queryset._clone()
        user = request.user
        groups = user.groups.get_query_set()

        qs = qs.complex_filter(Q(groups__in=groups) | Q(users__in=[user]))
        return qs

    class Meta:
        queryset = Report.objects.filter(is_active=True)
        limit = 20000
        fields = ('id',)
        resource_name = 'reporttree'
        authorization = DjangoAuthorization()
        filtering = {
            'id': ALL,
            'name': ('istartswith',),
            'is_active': ALL,
            'parent': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class QueryResource(ExtResource):
    """
    """
    class Meta:
        queryset = Query.objects.all()
        resource_name = 'sqlquery'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class ReportResource(ExtResource):
    """
    """
    sql_query = fields.ForeignKey(QueryResource, 'sql_query')

    def dehydrate(self, bundle):
        bundle.data['sql_query_text'] = bundle.obj.sql_query.sql
        return bundle

    class Meta:
        queryset = Report.objects.all()
        resource_name = 'report'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='reporting')

api.register(QueryResource())
api.register(ReportTreeResource())
api.register(ReportResource())
