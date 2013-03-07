# -*- coding: utf-8 -*-
from tastypie.api import Api
from tastypie import fields
from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL_WITH_RELATIONS, ALL
from store.models import Product
from apiutils.resources import ExtResource
from core.api import UnitResource
from tastypie.resources import ModelResource


class ProductResource(ExtResource):
    unit = fields.ForeignKey(UnitResource, 'unit', null=True)
    parent = fields.ForeignKey('self', 'parent', null=True)

    def obj_create(self, bundle, request=None, **kwargs):

        p = bundle.data['parent_uri']
        parent = p and self.get_via_uri(p) or None

        result = super(ProductResource, self)\
                    .obj_create(bundle=bundle, request=request, **kwargs)
        result.obj.parent = parent
        result.obj.save()
        return result

    class Meta:
        queryset = Product.objects.all()
        authorization = DjangoAuthorization()
        always_return_data = True
        resource_name = 'product'
        filtering = {
            'id': ALL,
            'name': ALL,
            'parent': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class ProductTreeResource(ModelResource):

    parent = fields.ForeignKey('self', 'parent', null=True)

    def dehydrate(self, bundle):
        bundle.data['text'] = bundle.obj.name
        bundle.data['is_group'] = bundle.obj.is_group
        bundle.data['checked'] = False
        bundle.data['parent'] = bundle.obj.parent and bundle.obj.parent.id
        bundle.data['leaf'] = not bundle.obj.is_group and bundle.obj.is_leaf_node()
        return bundle

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(ProductTreeResource, self).build_filters(filters)

        if "parent" in filters:
            if filters['parent'] == 'root':
                del orm_filters['parent__exact']
                orm_filters['parent__isnull'] = True

        return orm_filters

    class Meta:
        queryset = Product.objects.all()
        limit = 20000
        fields = ('id',)
        resource_name = 'producttree'
        authorization = DjangoAuthorization()
        filtering = {
            'id': ALL,
            'name': ('istartswith',),
            'code': ('istartswith',),
            'parent': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='store')

api.register(ProductResource())
api.register(ProductTreeResource())
