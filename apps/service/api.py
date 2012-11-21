# -*- coding: utf-8 -*-

from tastypie.resources import ModelResource
from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from service.models import BaseService, LabServiceGroup,\
     ExtendedService, ICD10, Material
from apiutils.resources import ExtResource
from tastypie.api import Api
from tastypie import fields
from lab.models import LabService
from django.db.models.expressions import F
import datetime


class LSResource(ExtResource):

    class Meta:
        queryset = LabService.objects.all()
        authorization = DjangoAuthorization()
        resource_name = 'ls'
        filtering = {
            'is_manual': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class MaterialResource(ExtResource):

    class Meta:
        queryset = Material.objects.all()
        limit = 20000
        resource_name = 'material'
        authorization = DjangoAuthorization()
        filtering = {
            'id': ALL,
            'name': ('istartswith',),
        }


class BaseServiceResource(ExtResource):
    """
    """
    parent = fields.ForeignKey('self', 'parent', null=True)
    material = fields.ForeignKey(MaterialResource, 'material', null=True)
    # labservice = fields.ForeignKey(LSResource, 'labservice', null=True)

    def obj_create(self, bundle, request=None, **kwargs):

        p = bundle.data['parent_uri']
        parent = self.get_via_uri(p)

        result = super(BaseServiceResource, self)\
                    .obj_create(bundle=bundle, request=request, **kwargs)
        result.obj.parent = parent
        result.obj.save()
        return result

    class Meta:
        queryset = BaseService.objects.all()
        authorization = DjangoAuthorization()
        always_return_data = True
        resource_name = 'baseservice'
        filtering = {
            'id': ALL,
            'name': ALL,
            'parent': ALL_WITH_RELATIONS,
            'labservice': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


lookups = {}
lookups[BaseService._meta.right_attr] = F(BaseService._meta.left_attr) + 1


class BaseServiceGroupResource(ExtResource):
    parent = fields.ForeignKey('self', 'parent', null=True)
    labservice = fields.ForeignKey(LSResource, 'labservice', null=True)

    def dehydrate(self, bundle):
        service = bundle.obj
        bundle.data['name'] = '-' * service.level + service.name
        return bundle

    class Meta:
        queryset = BaseService.objects.exclude(**lookups).order_by(\
            BaseService._meta.tree_id_attr, BaseService._meta.left_attr, 'level')
        authorization = DjangoAuthorization()
        always_return_data = True
        resource_name = 'baseservicegroup'
        filtering = {
            'id': ALL,
            'name': ALL,
            'parent': ALL_WITH_RELATIONS,
            'labservice': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class ExtendedServiceResource(ExtResource):
    """
    """
    base_service = fields.ForeignKey(BaseServiceResource, 'base_service')
    staff = fields.ManyToManyField('staff.api.PositionResource', 'staff', null=True)
    state = fields.ForeignKey('state.api.StateResource', 'state')

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(ExtendedServiceResource, self).build_filters(filters)

        if "payment_type" in filters:
            setattr(self, 'ptype', filters['payment_type'])
        if "on_date" in filters:
            on_date = datetime.datetime.strptime(filters['on_date'], '%Y-%m-%dT%H:%M:%S')
            setattr(self, 'on_date', on_date)

        return orm_filters

    def dehydrate(self, bundle):
        ptype = getattr(self, 'ptype', u'н')
        on_date = getattr(self, 'on_date', None)
        print on_date
        bundle.data['staff'] = bundle.obj.staff and [[staff.id, staff] for staff in bundle.obj.staff.all()] or None
        bundle.data['state_name'] = bundle.obj.state.name
        bundle.data['service_name'] = bundle.obj.base_service.name
        bundle.data['price'] = bundle.obj.get_actual_price(date=on_date, payment_type=ptype)
        return bundle

    class Meta:
        queryset = ExtendedService.objects.filter(is_active=True).select_related()
        resource_name = 'extendedservice'
        always_return_data = True
        authorization = DjangoAuthorization()
        filtering = {
            'id': ALL,
            'base_service': ALL_WITH_RELATIONS,
            'state': ALL_WITH_RELATIONS,
            'staff': ALL_WITH_RELATIONS,
            'name': ALL,
            'is_active': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class ExtServAdmResource(ExtendedServiceResource):

    def dehydrate(self, bundle):
        ptype = getattr(self, 'ptype', u'н')
        on_date = getattr(self, 'on_date', None)
        print on_date
        # bundle.data['staff'] = bundle.obj.staff and [[staff.id, staff] for staff in bundle.obj.staff.all()] or None
        bundle.data['state_name'] = bundle.obj.state.name
        bundle.data['service_name'] = bundle.obj.base_service.name
        bundle.data['price'] = bundle.obj.get_actual_price(date=on_date, payment_type=ptype)
        return bundle

    class Meta:
        queryset = ExtendedService.objects.all().select_related()
        resource_name = 'extserviceadm'
        always_return_data = True
        authorization = DjangoAuthorization()
        filtering = {
            'id': ALL,
            'base_service': ALL_WITH_RELATIONS,
            'state': ALL_WITH_RELATIONS,
            'staff': ALL_WITH_RELATIONS,
            'name': ALL,
            'is_active': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class LabServiceGroupResource(ModelResource):

    class Meta:
        queryset = LabServiceGroup.objects.all()
        resource_name = 'labgroup'
        limit = 10
        filtering = {
            'name': ('istartswith',)
        }
        list_allowed_methods = ['get', 'post', 'put']


class ICD10Resource(ModelResource):

    parent = fields.ForeignKey('self', 'parent', null=True)

    def dehydrate(self, bundle):
        bundle.data['text'] = "%s, %s" % (bundle.obj.code, bundle.obj.name)
        bundle.data['parent'] = bundle.obj.parent and bundle.obj.parent.id
        if bundle.obj.is_leaf_node():
            bundle.data['leaf'] = bundle.obj.is_leaf_node()
        return bundle

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(ICD10Resource, self).build_filters(filters)

        if "parent" in filters:
            if filters['parent'] == 'root':
                del orm_filters['parent__exact']
                orm_filters['parent__isnull'] = True

        return orm_filters

    class Meta:
        queryset = ICD10.objects.all()
        limit = 20000
        fields = ('id',)
        resource_name = 'icd10'
        authorization = DjangoAuthorization()
        filtering = {
            'id': ALL,
            'name': ('istartswith',),
            'code': ('istartswith',),
            'parent': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class BaseServiceTreeResource(ModelResource):

    parent = fields.ForeignKey('self', 'parent', null=True)

    def dehydrate(self, bundle):
        bundle.data['text'] = bundle.obj.name
        bundle.data['type'] = bundle.obj.type
        bundle.data['checked'] = False
        bundle.data['parent'] = bundle.obj.parent and bundle.obj.parent.id
        bundle.data['leaf'] = not bundle.obj.type == u'group' and bundle.obj.is_leaf_node()
        return bundle

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(BaseServiceTreeResource, self).build_filters(filters)

        if "parent" in filters:
            if filters['parent'] == 'root':
                del orm_filters['parent__exact']
                orm_filters['parent__isnull'] = True

        return orm_filters

    class Meta:
        queryset = BaseService.objects.all()
        limit = 20000
        fields = ('id',)
        resource_name = 'baseservicetree'
        authorization = DjangoAuthorization()
        filtering = {
            'id': ALL,
            'name': ('istartswith',),
            'code': ('istartswith',),
            'parent': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']

api = Api(api_name='service')

api.register(LSResource())
api.register(MaterialResource())
api.register(ExtServAdmResource())
api.register(BaseServiceResource())
api.register(BaseServiceTreeResource())
api.register(BaseServiceGroupResource())
api.register(ExtendedServiceResource())
api.register(LabServiceGroupResource())
api.register(ICD10Resource())
