# -*- coding: utf-8 -*-
from tastypie.api import Api
from tastypie import fields
from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL_WITH_RELATIONS, ALL
from store.models import Product, Document, DocumentItem, Lot, RegistryItem, Store
from apiutils.resources import ExtResource
from core.api import UnitResource
from tastypie.resources import ModelResource
from state.api import StateResource


class ProductResource(ExtResource):
    unit = fields.ForeignKey(UnitResource, 'unit', null=True)
    parent = fields.ForeignKey('self', 'parent', null=True)

    def obj_create(self, bundle, request=None, **kwargs):

        p = bundle.data['parent_uri']
        parent = p and self.get_via_uri(p) or None

        result = super(ProductResource, self).obj_create(bundle=bundle,
                                                         request=request,
                                                         **kwargs)
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


class StoreResource(ExtResource):
    state = fields.ForeignKey(StateResource, 'state')

    class Meta:
        queryset = Store.objects.all()
        authorization = DjangoAuthorization()
        always_return_data = True
        resource_name = 'store'
        filtering = {
            'id': ALL,
            'name': ALL,
            'state': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class DocumentResource(ExtResource):
    content_type = fields.ForeignKey('core.api.ContentTypeResource', 'content_type', null=True)

    class Meta:
        queryset = Document.objects.all()
        authorization = DjangoAuthorization()
        always_return_data = True
        resource_name = 'product'
        filtering = {
            'id': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class DocumentItemResource(ExtResource):
    document = fields.ForeignKey(DocumentResource, 'document')
    product = fields.ForeignKey(ProductResource, 'product')

    class Meta:
        queryset = DocumentItem.objects.all()
        authorization = DjangoAuthorization()
        always_return_data = True
        resource_name = 'docitem'
        filtering = {
            'id': ALL,
            'document': ALL_WITH_RELATIONS,
            'product': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class LotResource(ExtResource):
    document = fields.ForeignKey(DocumentResource, 'document')
    product = fields.ForeignKey(ProductResource, 'property')

    class Meta:
        queryset = Lot.objects.all()
        authorization = DjangoAuthorization()
        always_return_data = True
        resource_name = 'lot'
        filtering = {
            'id': ALL,
            'document': ALL_WITH_RELATIONS,
            'product': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class RegistryItemResource(ExtResource):
    lot = fields.ForeignKey(LotResource, 'lot')

    class Meta:
        queryset = RegistryItem.objects.all()
        authorization = DjangoAuthorization()
        always_return_data = True
        resource_name = 'regitem'
        filtering = {
            'id': ALL,
            'lot': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='store')

api.register(ProductResource())
api.register(ProductTreeResource())
api.register(DocumentResource())
api.register(DocumentItemResource())
api.register(StoreResource())
api.register(LotResource())
api.register(RegistryItemResource())
