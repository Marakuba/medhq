# -*- coding: utf-8 -*-

from tastypie.resources import ModelResource
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie import fields
from tastypie.api import Api
from apiutils.resources import ExtResource, ComplexQuery
from staff.models import Position, Staff, Doctor
from patient.utils import smartFilter
from django.db.models.query_utils import Q
from tastypie.cache import SimpleCache


class StaffResource(ModelResource):
    referral = fields.ForeignKey('visit.api.ReferralResource', 'referral', null=True)
    """
    """
    def dehydrate(self, bundle):
        bundle.data['name'] = bundle.obj.short_name()
        bundle.data['referral_type'] = bundle.obj.referral and bundle.obj.referral.referral_type
        bundle.data['title'] = bundle.obj.short_name()
        return bundle

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(StaffResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'])
            if len(smart_filters.keys()) == 1:
                try:
                    orm_filters = ComplexQuery(Q(visit__barcode__id=int(filters['search']))\
                                    | Q(**smart_filters), **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)

        return orm_filters

    class Meta:
        queryset = Staff.objects.filter(status=u'д')
        resource_name = 'staff'
        always_return_data = True
        limit = 100
        filtering = {
            'last_name': ('istartswith',),
            'id': ALL,
            'status': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class PositionResource(ModelResource):
    """
    """
    staff = fields.ForeignKey(StaffResource, 'staff')

    def dehydrate(self, bundle):
        bundle.data['text'] = bundle.obj.__unicode__()
        bundle.data['name'] = bundle.obj.__unicode__()
        return bundle

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(PositionResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'staff')
            if len(smart_filters.keys()) == 1:
                try:
                    orm_filters = ComplexQuery(Q(visit__barcode__id=int(filters['search']))\
                                | Q(**smart_filters), **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)

        return orm_filters

    class Meta:
        queryset = Position.objects.select_related().all()
        resource_name = 'position'
        always_return_data = True
        caching = SimpleCache()
        limit = 200
        filtering = {
            'id': ALL,
            'title': ('istartswith',),
            'staff': ALL_WITH_RELATIONS,
        }
        list_allowed_methods = ['get', 'post', 'put']


class StaffSchedResource(ModelResource):
    """
    """
    #doctor = fields.ToOneField(DoctorResource, 'doctor', null=True)

    def dehydrate(self, bundle):
        bundle.data['name'] = bundle.obj.short_name()
        bundle.data['title'] = bundle.obj.short_name()
        bundle.data['timeslot'] = bundle.obj.doctor.timeslot
        bundle.data['am_session_starts'] = bundle.obj.doctor.am_session_starts
        bundle.data['am_session_ends'] = bundle.obj.doctor.am_session_ends
        bundle.data['pm_session_starts'] = bundle.obj.doctor.pm_session_starts
        bundle.data['pm_session_ends'] = bundle.obj.doctor.pm_session_ends
        bundle.data['routine'] = bundle.obj.doctor.routine
        bundle.data['work_days'] = bundle.obj.doctor.work_days
        bundle.data['room'] = bundle.obj.doctor.room
        return bundle

    class Meta:
        queryset = Staff.objects.filter(doctor__isnull=False, status=u'д')
        resource_name = 'staffsched'
        always_return_data = True
        limit = 100
        filtering = {
            'last_name': ('istartswith',),
            'id': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class PosSchedResource(ModelResource):
    """
    """
    #doctor = fields.ToOneField(DoctorResource, 'doctor', null=True)
    department = fields.ForeignKey('state.api.DepartmentResource', 'department', null=True)
    staff = fields.ForeignKey(StaffResource, 'staff', null=True)

    def dehydrate(self, bundle):
        bundle.data['name'] = bundle.obj.staff.short_name()
        bundle.data['short_name'] = bundle.obj.staff.short_name()
        bundle.data['timeslot'] = bundle.obj.staff.doctor.timeslot
        bundle.data['am_session_starts'] = bundle.obj.staff.doctor.am_session_starts
        bundle.data['am_session_ends'] = bundle.obj.staff.doctor.am_session_ends
        bundle.data['pm_session_starts'] = bundle.obj.staff.doctor.pm_session_starts
        bundle.data['pm_session_ends'] = bundle.obj.staff.doctor.pm_session_ends
        bundle.data['routine'] = bundle.obj.staff.doctor.routine
        bundle.data['work_days'] = bundle.obj.staff.doctor.work_days
        bundle.data['room'] = bundle.obj.staff.doctor.room
        return bundle

    class Meta:
        queryset = Position.objects.filter(staff__doctor__isnull=False)
        resource_name = 'possched'
        always_return_data = True
        limit = 100
        filtering = {
            'last_name': ('istartswith',),
            'id': ALL,
            'is_active': ALL,
            'staff': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class DoctorResource(ExtResource):
    """
    """
    staff = fields.ToOneField(StaffResource, 'staff')

    class Meta:
        queryset = Doctor.objects.all()
        resource_name = 'doctor'
        limit = 100
        filtering = {
            'id': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='staff')

api.register(PositionResource())
api.register(StaffResource())
api.register(StaffSchedResource())
api.register(PosSchedResource())
api.register(DoctorResource())
