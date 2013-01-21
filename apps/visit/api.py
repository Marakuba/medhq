# -*- coding: utf-8 -*-

from tastypie.api import Api
from tastypie import fields
from tastypie.authorization import DjangoAuthorization
from visit.models import Visit, Referral, OrderedService
from apiutils.resources import ExtResource, ComplexQuery, ExtBatchResource
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from apiutils.utils import none_to_empty
from patient.utils import smartFilter
from django.db.models.query_utils import Q
from tastypie.cache import SimpleCache
from django.core.exceptions import ObjectDoesNotExist
from tastypie.exceptions import NotFound


class ReferralResource(ExtResource):

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        result = super(ReferralResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    def dehydrate(self, bundle):
        bundle.data['referral_type_name'] = bundle.obj.get_referral_type_display()
        return bundle

    class Meta:
        queryset = Referral.objects.all()
        resource_name = 'referral'
        always_return_data = True
        limit = 200
        authorization = DjangoAuthorization()
        filtering = {
            'name': ('istartswith',),
            'id': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class VisitResource(ExtResource):
    patient = fields.ToOneField('patient.api.PatientResource', 'patient', null=True)
    office = fields.ToOneField('state.api.StateResource', 'office', null=True)
    referral = fields.ToOneField(ReferralResource, 'referral', null=True)
    source_lab = fields.ToOneField('state.api.LabResource', 'source_lab', null=True)
    payer = fields.ToOneField('state.api.StateResource', 'payer', null=True)
    discount = fields.ToOneField('pricelist.api.DiscountResource', 'discount', null=True)
    barcode = fields.ForeignKey('numeration.api.BarcodeResource', 'barcode', null=True)
    insurance_policy = fields.ToOneField('patient.api.InsurancePolicyResource', 'insurance_policy', null=True)
    contract = fields.ForeignKey('patient.api.ContractResource', 'contract', null=True)

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        kwargs['office'] = request.active_profile.department.state
        result = super(VisitResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    def dehydrate(self, bundle):
        bundle.data['referral_name'] = bundle.obj.referral
        bundle.data['operator_name'] = bundle.obj.operator
        bundle.data['discount_value'] = bundle.obj.discount and int(bundle.obj.discount.value) or 0
        bundle.data['patient_name'] = bundle.obj.patient.short_name()
        bundle.data['office_name'] = bundle.obj.office
        bundle.data['payer_name'] = bundle.obj.payer and bundle.obj.payer.name or ''
        bundle.data['patient_id'] = bundle.obj.patient_id
        bundle.data['barcode_id'] = bundle.obj.barcode_id

        return none_to_empty(bundle)

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(VisitResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'patient')
            if len(smart_filters.keys()) == 1:
                try:
                    orm_filters = ComplexQuery(Q(barcode__id=int(\
                                filters['search'])) | Q(**smart_filters), \
                                **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)

#            orm_filters.update(smartFilter(filters['search'], 'patient'))

        return orm_filters

    class Meta:
        queryset = Visit.objects.select_related().filter(cls__in=(u'п', u'б'))
        resource_name = 'visit'
        allowed_methods = ['get', 'post', 'put']
        authorization = DjangoAuthorization()
        caching = SimpleCache()
        always_return_data = True
        filtering = {
            'patient': ALL_WITH_RELATIONS,
            'barcode': ALL_WITH_RELATIONS,
            'payer': ALL_WITH_RELATIONS,
            'id': ALL,
            'created': ALL,
            'is_cito': ALL,
            'office': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class RefundResource(ExtResource):
    patient = fields.ToOneField('patient.api.PatientResource', 'patient', null=True)
    office = fields.ToOneField('state.api.StateResource', 'office', null=True)
    referral = fields.ToOneField(ReferralResource, 'referral', null=True)
    source_lab = fields.ToOneField('state.api.LabResource', 'source_lab', null=True)
    discount = fields.ToOneField('pricelist.api.DiscountResource', 'discount', null=True)
    insurance_policy = fields.ToOneField('patient.api.InsurancePolicyResource', 'insurance_policy', null=True)

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        kwargs['office'] = request.active_profile.department.state
        result = super(RefundResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    def dehydrate(self, bundle):
        bundle.data['referral_name'] = bundle.obj.referral
        bundle.data['operator_name'] = bundle.obj.operator
        bundle.data['discount_value'] = bundle.obj.discount and int(bundle.obj.discount.value) or 0
        bundle.data['patient_name'] = bundle.obj.patient.short_name()
        bundle.data['office_name'] = bundle.obj.office
        bundle.data['total_price'] = -bundle.obj.total_price
        bundle.data['total_discount'] = -bundle.obj.total_discount
        bundle.data['patient_id'] = bundle.obj.patient.id
        return none_to_empty(bundle)

    class Meta:
        queryset = Visit.objects.filter(cls__in=(u'в',))
        resource_name = 'refund'
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'patient': ALL_WITH_RELATIONS,
            'id': ALL,
            'created': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class OrderedServiceResource(ExtBatchResource):
    """
    """
    order = fields.ToOneField(VisitResource, 'order')
    service = fields.ToOneField('service.api.BaseServiceResource', 'service')
    staff = fields.ToOneField('staff.api.PositionResource', 'staff', full=True, null=True)
    sampling = fields.ForeignKey('lab.api.SamplingResource', 'sampling', null=True)
    execution_place = fields.ForeignKey('state.api.StateResource', 'execution_place')
    assigment = fields.ForeignKey('scheduler.api.PreorderResource', 'assigment', null=True)

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        result = super(VisitResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    def obj_update(self, bundle, request=None, **kwargs):
        result = super(OrderedServiceResource, self).obj_update(bundle=bundle, request=request, **kwargs)
        return result

    def dehydrate(self, bundle):
        service = bundle.obj.service
        bundle.data['service_name'] = service.short_name or service.name
        bundle.data['service_full_name'] = service.name
        bundle.data['created'] = bundle.obj.order.created
        bundle.data['visit_id'] = bundle.obj.order.id
        bundle.data['barcode'] = bundle.obj.order.barcode_id
        bundle.data['patient_name'] = bundle.obj.order.patient.short_name()
        bundle.data['payer_name'] = bundle.obj.order.payer and bundle.obj.order.payer.name or ''
#        bundle.data['operator_name'] = bundle.obj.operator
#        bundle.data['laboratory'] = bundle.obj.execution_place
#        bundle.data['sampling'] = bundle.obj.sampling and bundle.obj.sampling.short_title()
        return bundle

    class Meta:
        queryset = OrderedService.objects.all()
        resource_name = 'orderedservice'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 100
        filtering = {
            'id': ALL,
            'order': ALL_WITH_RELATIONS,
            'sampling': ALL_WITH_RELATIONS,
            'execution_place': ALL_WITH_RELATIONS,
            'staff': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class LabOrderedServiceResource(OrderedServiceResource):

    def dehydrate(self, bundle):
        o = bundle.obj
        service = o.service
        bundle.data['service_name'] = service.short_name or service.name
        bundle.data['service_full_name'] = service.name
        bundle.data['created'] = bundle.obj.order.created
        bundle.data['visit_id'] = bundle.obj.order.id
        bundle.data['barcode'] = bundle.obj.order.barcode_id
        bundle.data['patient_name'] = bundle.obj.order.patient.short_name()
        bundle.data['operator_name'] = bundle.obj.operator
        bundle.data['laboratory'] = bundle.obj.execution_place
        bundle.data['sampling'] = bundle.obj.sampling and bundle.obj.sampling.short_title()
#        bundle.data['message'] = o.latest_transaction()
        return bundle

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(LabOrderedServiceResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'order__patient')
            if len(smart_filters.keys()) == 1:
                try:
                    orm_filters = ComplexQuery(Q(order__barcode__id=int(\
                        filters['search'])) | Q(**smart_filters), **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)

        return orm_filters

    class Meta:
        queryset = OrderedService.objects.select_related().all()
        resource_name = 'laborderedservice'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 100
        filtering = {
            'order': ALL_WITH_RELATIONS,
            'sampling': ALL_WITH_RELATIONS,
            'service': ALL_WITH_RELATIONS,
            'status': ALL,
            'created': ALL,
            'execution_place': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class LabServiceResource(ExtResource):
    """
    """
    order = fields.ToOneField(VisitResource, 'order')
    service = fields.ToOneField('service.api.BaseServiceResource', 'service')
    staff = fields.ToOneField('staff.api.PositionResource', 'staff', null=True)

    def dehydrate(self, bundle):
        service = bundle.obj.service
        bundle.data['staff_name'] = bundle.obj.staff and bundle.obj.staff.short_name() or ''
        bundle.data['service_name'] = service.short_name or service.name
        bundle.data['service_code'] = service.labservice and service.labservice.code or ''
        bundle.data['patient_name'] = bundle.obj.order.patient.full_name()
        bundle.data['operator_name'] = bundle.obj.order.operator
        bundle.data['office_name'] = bundle.obj.order.office
        bundle.data['laboratory'] = bundle.obj.execution_place
        bundle.data['barcode'] = bundle.obj.order.barcode_id
        return bundle

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(LabServiceResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'order__patient')
            if len(smart_filters.keys()) == 1:
                try:
                    orm_filters = ComplexQuery(Q(order__barcode__id=int(\
                        filters['search'])) | Q(**smart_filters), **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)

        return orm_filters

    class Meta:
        queryset = OrderedService.objects.filter(
                    service__labservice__is_manual=True)  # all lab services
        resource_name = 'labservice'
        always_return_data = True
        authorization = DjangoAuthorization()
        limit = 50
        filtering = {
            'created': ALL_WITH_RELATIONS,
            'order': ALL_WITH_RELATIONS,
            'staff': ALL_WITH_RELATIONS,
        }
        list_allowed_methods = ['get', 'post', 'put']


class LabTestResource(ExtResource):
    """
    """
    order = fields.ToOneField(VisitResource, 'order')
    execution_place = fields.ToOneField('state.api.StateResource', 'execution_place')
    service = fields.ToOneField('service.api.BaseServiceResource', 'service')
    staff = fields.ToOneField('staff.api.PositionResource', 'staff', null=True)
    #sampling = fields.ForeignKey('lab.api.SamplingResource', 'sampling', null=True)

    def dehydrate(self, bundle):
        service = bundle.obj.service
        order = bundle.obj.order
        patient = order.patient
        bundle.data['service_name'] = service.short_name or service.name
        bundle.data['service_full_name'] = service.name
#        bundle.data['lab_group'] = service.lab_group
        bundle.data['created'] = order.created
        bundle.data['printed'] = bundle.obj.print_date
        bundle.data['barcode'] = order.barcode_id
        bundle.data['patient'] = patient.full_name()
        bundle.data['patient_age'] = patient.full_age()
        bundle.data['staff_name'] = bundle.obj.staff
        bundle.data['laboratory'] = bundle.obj.execution_place
        bundle.data['key'] = u"%s_%s" % (order.id, bundle.obj.execution_place.id)
        return bundle

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}
        orm_filters = super(LabTestResource, self).build_filters(filters)
        if "search" in filters:
            orm_filters.update(smartFilter(filters['search']), 'order__patient')
        return orm_filters

    class Meta:
        queryset = OrderedService.objects.select_related().\
                    filter(service__lab_group__isnull=False).\
                    order_by('service', '-created')  # all lab services
        resource_name = 'labtest'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 10000
        filtering = {
            'order': ALL_WITH_RELATIONS,
#            'sampling': ALL_WITH_RELATIONS,
            'execution_place': ALL_WITH_RELATIONS,
            'executed': ALL,
            'created': ALL_WITH_RELATIONS
        }
        cache = SimpleCache()
        list_allowed_methods = ['get', 'post', 'put']


class ExamServiceResource(ExtResource):
    """
    """
    order = fields.ToOneField(VisitResource, 'order')
    execution_place = fields.ToOneField('state.api.StateResource', 'execution_place')
    service = fields.ToOneField('service.api.BaseServiceResource', 'service')
    staff = fields.ToOneField('staff.api.PositionResource', 'staff', null=True)
    sampling = fields.ForeignKey('lab.api.SamplingResource', 'sampling', null=True)

    def dehydrate(self, bundle):
        service = bundle.obj.service
        bundle.data['service_name'] = service.short_name or service.name
        bundle.data['service_full_name'] = service.name
        #bundle.data['lab_group'] = service.lab_group
        bundle.data['created'] = bundle.obj.order.created
        bundle.data['printed'] = bundle.obj.print_date
        bundle.data['barcode'] = bundle.obj.order.barcode_id
        bundle.data['patient_full'] = bundle.obj.order.patient.full_name()
        bundle.data['patient_name'] = bundle.obj.order.patient.short_name()
        bundle.data['patient_age'] = bundle.obj.order.patient.full_age()
        bundle.data['patient'] = bundle.obj.order.patient.id
        bundle.data['staff_name'] = bundle.obj.staff
        bundle.data['laboratory'] = bundle.obj.execution_place
        bundle.data['key'] = u"%s_%s" % (bundle.obj.order.id, bundle.obj.execution_place.id)
        return bundle

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}
        orm_filters = super(ExamServiceResource, self).build_filters(filters)
        if "search" in filters:
            orm_filters.update(smartFilter(filters['search'], 'order__patient'))
        return orm_filters

    class Meta:
        queryset = OrderedService.objects.filter(service__lab_group__isnull=True)
        resource_name = 'examservice'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 50
        filtering = {
            'id': ALL,
            'order': ALL_WITH_RELATIONS,
            'sampling': ALL_WITH_RELATIONS,
            'staff': ALL_WITH_RELATIONS,
            'execution_place': ALL_WITH_RELATIONS,
            'executed': ALL,
            'created': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class SamplingServiceResource(ExtResource):
    """
    """
    order = fields.ToOneField(VisitResource, 'order')
    service = fields.ToOneField('service.api.BaseServiceResource', 'service')
    staff = fields.ToOneField('staff.api.PositionResource', 'staff', full=True, null=True)
    sampling = fields.ForeignKey('lab.api.SamplingResource', 'sampling', null=True)

    def obj_update(self, bundle, request=None, **kwargs):
        result = super(SamplingServiceResource, self).obj_update(bundle=bundle, request=request, **kwargs)
        return result

    def obj_delete(self, request=None, **kwargs):
        """
        """
        try:
            obj = self.get_object_list(request).get(**kwargs)
        except ObjectDoesNotExist:
            raise NotFound("A model instance matching the provided arguments could not be found.")

        obj.sampling = None
        obj.save()

    def dehydrate(self, bundle):
        service = bundle.obj.service
        bundle.data['service_name'] = service.short_name or service.name
        bundle.data['service_full_name'] = service.name
        bundle.data['created'] = bundle.obj.order.created
        bundle.data['visit_id'] = bundle.obj.order.id
        bundle.data['patient_name'] = bundle.obj.order.patient.short_name()
        bundle.data['barcode'] = bundle.obj.order.barcode_id
        bundle.data['sampling'] = bundle.obj.sampling
        return bundle

    class Meta:
        queryset = OrderedService.objects.all()
        limit = 100
        resource_name = 'samplingservice'
        always_return_data = True
        authorization = DjangoAuthorization()
        filtering = {
            'order': ALL_WITH_RELATIONS,
            'sampling': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class ServiceBasketResource(ExtBatchResource):
    """
    """
    order = fields.ToOneField(VisitResource, 'order', null=True)
    service = fields.ToOneField('service.api.BaseServiceResource', 'service', null=True)
    staff = fields.ToOneField('staff.api.PositionResource', 'staff', null=True)
    execution_place = fields.ToOneField('state.api.StateResource', 'execution_place')
    assigment = fields.ForeignKey('scheduler.api.PreorderResource', 'assigment', null=True)

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        result = super(ServiceBasketResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    def hydrate(self, bundle):
        return bundle

    def dehydrate(self, bundle):
        obj = bundle.obj
        if obj.staff:
            bundle.data['staff_name'] = obj.staff.__unicode__()
        bundle.data['service_name'] = obj.service.short_name or obj.service.name
        return bundle

    class Meta:
        queryset = OrderedService.objects.select_related().all()
        resource_name = 'servicebasket'
        allowed_methods = ['get', 'post', 'put']
        always_return_data = True
        filtering = {
            'order': ALL_WITH_RELATIONS
        }
        limit = 500
        authorization = DjangoAuthorization()
        list_allowed_methods = ['get', 'post', 'put']


class RefundBasketResource(ExtResource):
    """
    """
    order = fields.ToOneField(RefundResource, 'order', null=True)
    service = fields.ToOneField('service.api.BaseServiceResource', 'service', null=True)
    staff = fields.ToOneField('staff.api.PositionResource', 'staff', null=True)
    execution_place = fields.ToOneField('state.api.StateResource', 'execution_place')

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        result = super(RefundBasketResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    def dehydrate(self, bundle):
        obj = bundle.obj
        if obj.staff:
            bundle.data['staff_name'] = obj.staff.__unicode__()
        bundle.data['service_name'] = obj.service.short_name or obj.service.name
        bundle.data['price'] = -bundle.obj.price
        bundle.data['total_price'] = -bundle.obj.price
        return bundle

    class Meta:
        queryset = OrderedService.objects.select_related().all()
        resource_name = 'refundbasket'
        always_return_data = True
        filtering = {
            'order': ALL_WITH_RELATIONS
        }
        limit = 500
        authorization = DjangoAuthorization()
        list_allowed_methods = ['get', 'post', 'put']


class ServiceToSend(ExtResource):
    """
    """

    order = fields.ToOneField(VisitResource, 'order')
    service = fields.ToOneField('service.api.BaseServiceResource', 'service')
    staff = fields.ToOneField('staff.api.PositionResource', 'staff', full=True, null=True)
    execution_place = fields.ForeignKey('state.api.StateResource', 'execution_place')
    sampling = fields.ForeignKey('lab.api.SamplingResource', 'sampling', null=True)

    def dehydrate(self, bundle):
        bundle.data['operator_name'] = bundle.obj.operator
        bundle.data['service_name'] = bundle.obj.service
        bundle.data['patient_id'] = bundle.obj.order.patient.id
        bundle.data['patient_name'] = bundle.obj.order.patient.full_name()
        bundle.data['patient_birthday'] = bundle.obj.order.patient.birth_day
        bundle.data['sku'] = bundle.obj.service.code
        return bundle

    class Meta:
        queryset = OrderedService.objects.filter(service__lab_group__isnull=False)
        resource_name = 'servicetosend'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
            'state': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='visit')

api.register(VisitResource())
api.register(ReferralResource())
api.register(OrderedServiceResource())
api.register(LabOrderedServiceResource())
api.register(SamplingServiceResource())
api.register(ServiceBasketResource())
api.register(RefundResource())
api.register(RefundBasketResource())
api.register(LabServiceResource())
api.register(LabTestResource())
api.register(ExamServiceResource())
api.register(ServiceToSend())
