# -*- coding: utf-8 -*-

from tastypie.resources import ModelResource
from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie import fields
from tastypie.api import Api
from apiutils.resources import ExtResource
from numeration.models import BarcodePackage, NumeratorItem, Barcode
from visit.models import Visit


class BarcodeResource(ModelResource):
    """
    """

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(BarcodeResource, self).build_filters(filters)

        if "patient" in filters:
            patient_id = filters['patient']
            visit_list = Visit.objects.filter(patient=patient_id)
            barcode_id_list = [visit.barcode.id for visit in visit_list]
            orm_filters['id__in'] = barcode_id_list

        return orm_filters

    class Meta:
        queryset = Barcode.objects.all()
        resource_name = 'barcode'
        always_return_data = True
        filtering = {
            'visit': ALL_WITH_RELATIONS,
            'id': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class BCPackageResource(ExtResource):
    """
    """
    laboratory = fields.ForeignKey('state.api.StateResource', 'laboratory')

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        result = super(BCPackageResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle.data['lab_name'] = obj.laboratory
        bundle.data['lat'] = obj.laboratory.translify()
        rng = obj.range()
        bundle.data['range_from'] = rng[0]
        bundle.data['range_to'] = rng[1]
        return bundle

    class Meta:
        queryset = BarcodePackage.objects.all()
        always_return_data = True
        authorization = DjangoAuthorization()
        resource_name = 'barcodepackage'
        filtering = {
        }
        list_allowed_methods = ['get', 'post', 'put']


class NumeratorItemResource(ModelResource):
    """
    """
    class Meta:
        queryset = NumeratorItem.objects.all()
        resource_name = 'numerator'
        filtering = {
        }
        list_allowed_methods = ['get', 'post', 'put']

api = Api(api_name='numeration')

api.register(BarcodeResource())
api.register(BCPackageResource())
api.register(NumeratorItemResource())
