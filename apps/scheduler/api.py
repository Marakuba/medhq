# -*- coding: utf-8 -*-

from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie import fields
from tastypie.api import Api
from apiutils.resources import ExtResource, ComplexQuery, ExtBatchResource
from scheduler.models import RejectionCause, Calendar, Event, Preorder
from patient.utils import smartFilter
from django.db.models.query_utils import Q


class CalendarResource(ExtResource):

    class Meta:
        queryset = Calendar.objects.all()
        resource_name = 'calendar'
        authorization = DjangoAuthorization()
        filtering = {
            'title': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class RejectionCauseResource(ExtResource):

    class Meta:
        queryset = RejectionCause.objects.all()
        resource_name = 'rejection_cause'
        authorization = DjangoAuthorization()
        filtering = {
            'name': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class EventResource(ExtResource):
    staff = fields.ForeignKey('staff.api.PositionResource', 'staff', null=True)
    #preord = fields.ToOneField(PreorderResource, 'preord', null=True)

    def dehydrate(self, bundle):
        bundle.data['start'] = bundle.obj.start.strftime('%a %b %d %Y %H:%M:%S')
        bundle.data['end'] = bundle.obj.end.strftime('%a %b %d %Y %H:%M:%S ')
        #bundle.data['preord'] = bundle.obj.preord and bundle.obj.preord.id
        return bundle

    class Meta:
        queryset = Event.objects.all().select_related().order_by('start')
        resource_name = 'event'
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'title': ALL,
            'id': ALL,
            'cid': ALL,
            'start': ALL,
            'end': ALL,
            'timeslot': ALL,
            'status': ALL,
            'preord': ALL

        }
        limit = 1000
        list_allowed_methods = ['get', 'post', 'put']


class PreorderResource(ExtBatchResource):
    patient = fields.ForeignKey('patient.api.PatientResource', 'patient', null=True)
    timeslot = fields.OneToOneField(EventResource, 'timeslot', null=True)
    service = fields.ForeignKey('service.api.ExtendedServiceResource', 'service', null=True)
    promotion = fields.ForeignKey('promotion.api.PromotionResource', 'promotion', null=True)
    rejection_cause = fields.ForeignKey(RejectionCauseResource, 'rejection_cause', null=True)
    card = fields.ForeignKey('examination.api.CardResource', 'card', null=True)
    referral = fields.ForeignKey('visit.api.ReferralResource', 'referral', null=True)
    who_deleted = fields.ForeignKey('core.api.UserResource', 'who_deleted', null=True)

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        referral = request and request.active_profile.staff.referral
        if referral:
            kwargs['referral'] = referral
        result = super(PreorderResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    def obj_update(self, bundle, request=None, **kwargs):
        if bundle.data['deleted']:
            bundle.data['who_deleted'] = request.user
        result = super(PreorderResource, self).obj_update(bundle=bundle, request=request, **kwargs)
        return result

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(PreorderResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'patient')
            if len(smart_filters.keys()) == 1:
                try:
                    orm_filters = ComplexQuery(Q(barcode__id=int(filters['search']))\
                                     | Q(**smart_filters), **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)
        return orm_filters

    class Meta:
        queryset = Preorder.objects.filter(deleted=False)
        resource_name = 'preorder'
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'patient': ALL_WITH_RELATIONS,
            'timeslot': ALL,
            'service': ALL_WITH_RELATIONS,
            'payment_type': ALL,
            'card': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class ExtPreorderResource(ExtResource):
    patient = fields.ForeignKey('patient.api.PatientResource', 'patient', null=True)
    timeslot = fields.OneToOneField(EventResource, 'timeslot', null=True)
    visit = fields.OneToOneField('visit.api.VisitResource', 'visit', null=True)
    service = fields.ForeignKey('service.api.ExtendedServiceResource', 'service', null=True)
    promotion = fields.ForeignKey('promotion.api.PromotionResource', 'promotion', null=True)
    card = fields.ForeignKey('examination.api.CardResource', 'card', null=True)
    referral = fields.ForeignKey('visit.api.ReferralResource', 'referral', null=True)
    who_deleted = fields.ForeignKey('core.api.UserResource', 'who_deleted', null=True)

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        referral = request and request.active_profile.staff.referral
        if referral:
            kwargs['referral'] = referral
        result = super(ExtPreorderResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    def obj_update(self, bundle, request=None, **kwargs):
#        import pdb; pdb.set_trace()
        if bundle.data['deleted']:
            bundle.data['who_deleted'] = request.user
        result = super(ExtPreorderResource, self).obj_update(bundle=bundle, request=request, **kwargs)
        return result

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(ExtPreorderResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'patient')
            if len(smart_filters.keys()) == 1:
                try:
                    orm_filters = ComplexQuery(Q(barcode__id=int(filters['search']))\
                                                | Q(**smart_filters), **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)
        return orm_filters

    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle.data['service_name'] = obj.service and obj.service.base_service.name
        bundle.data['patient_name'] = obj.patient and obj.patient.full_name() or u'Пациент не указан'
        bundle.data['patient_birthday'] = obj.patient and obj.patient.birth_day
        bundle.data['ptype_name'] = obj.get_payment_type_display()
        bundle.data['execution_place'] = obj.service and obj.service.state_id
        bundle.data['execution_place_name'] = obj.service and obj.service.state.name
        bundle.data['promotion_name'] = obj.promotion and obj.promotion.name or ''
        bundle.data['promo_discount'] = obj.promotion and obj.promotion.discount and obj.promotion.discount_id or ''
        bundle.data['staff'] = obj.timeslot and obj.timeslot.cid
        bundle.data['staff_name'] = obj.timeslot and obj.timeslot.cid and obj.get_staff_name()
        bundle.data['price'] = obj.price or (obj.service and obj.service.get_actual_price(payment_type=obj.payment_type))
        bundle.data['start'] = obj.timeslot and obj.timeslot.start
        bundle.data['base_service'] = obj.service and obj.service.base_service_id
        bundle.data['patient_phone'] = obj.patient and obj.patient.mobile_phone
        bundle.data['operator_name'] = obj.operator or ''
        bundle.data['branches'] = obj.service and bundle.obj.service.branches.all().values_list('id', flat=True)
        bundle.data['referral_name'] = obj.referral and obj.referral.__unicode__()
        return bundle

    class Meta:
        queryset = Preorder.objects.filter(deleted=False).select_related().order_by('-timeslot__start')
        resource_name = 'extpreorder'
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'deleted': ALL,
            'patient': ALL,
            'start': ALL,
            'timeslot': ALL_WITH_RELATIONS,
            'service': ALL_WITH_RELATIONS,
            'visit': ALL_WITH_RELATIONS,
            'card': ALL_WITH_RELATIONS,
            'payment_type': ALL,
            'id': ALL
        }
        limit = 500
        list_allowed_methods = ['get', 'post', 'put']


class VisitPreorderResource(ExtPreorderResource):
    """
    Используется в форме визита при выборе предзаказа.
    Содержит неоформленные предзаказы начиная с сегодняшнего дня и направления
    """

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(VisitPreorderResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'patient')
            if len(smart_filters.keys()) == 1:
                try:
                    orm_filters = ComplexQuery(Q(barcode__id=int(filters['search']))\
                                                | Q(**smart_filters), **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)
        return orm_filters

    class Meta:
        queryset = Preorder.objects.filter(timeslot__isnull=True).order_by('-expiration')
        resource_name = 'visitpreorder'
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'deleted': ALL,
            'patient': ALL,
            'start': ALL,
            'expiration': ALL,
            'timeslot': ALL_WITH_RELATIONS,
            'service': ALL_WITH_RELATIONS,
            'visit': ALL_WITH_RELATIONS,
            'card': ALL_WITH_RELATIONS,
            'payment_type': ALL
        }
        limit = 500
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='scheduler')

api.register(RejectionCauseResource())
api.register(CalendarResource())
api.register(PreorderResource())
api.register(ExtPreorderResource())
api.register(EventResource())
api.register(VisitPreorderResource())
