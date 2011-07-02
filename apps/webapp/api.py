# -*- coding: utf-8 -*-

from tastypie.resources import ModelResource
from patient.models import Patient
from visit.models import Visit, Referral, OrderedService
from tastypie import fields
from tastypie.api import Api
from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from lab.models import LabOrder
from service.models import BaseService
from staff.models import Position
from state.models import State
from django.conf import settings
from pricelist.models import Discount
from api.utils import none_to_empty
from api.resources import ExtResource


class PatientResource(ExtResource):

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
        result = super(PatientResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    class Meta:
        queryset = Patient.objects.all() #@UndefinedVariable
        resource_name = 'patient'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        filtering = {
            'last_name':('istartswith',),
            'id':ALL
        }
        
        
class ReferralResource(ExtResource):

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
        result = super(ReferralResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    class Meta:
        queryset = Referral.objects.all() #@UndefinedVariable
        resource_name = 'referral'
        limit = 200
        authorization = DjangoAuthorization()
        filtering = {
            'name':('istartswith',)
        }
        

        
class LabResource(ModelResource):

    class Meta:
        queryset = State.objects.filter(type__in=('m','b')).exclude(id=settings.MAIN_STATE_ID) 
        resource_name = 'lab'
        limit = 10
        filtering = {
            'name':('istartswith',)
        }
        

class StateResource(ModelResource):

    class Meta:
        queryset = State.objects.all() 
        resource_name = 'state'
        limit = 10
        filtering = {
            'name':('istartswith',)
        }
        
class DiscountResource(ModelResource):

    def dehydrate(self, bundle):
        bundle.data['title'] = "%s, %s" % (bundle.obj.name, bundle.obj.value)
        return bundle
    
    class Meta:
        queryset = Discount.objects.all() 
        resource_name = 'discount'
        filtering = {
#            'name':('istartswith',)
        }
        

class VisitResource(ExtResource):
    patient = fields.ToOneField(PatientResource, 'patient', null=True)
    referral = fields.ToOneField(ReferralResource,'referral', null=True)
    source_lab = fields.ToOneField(LabResource,'source_lab', null=True)
    discount = fields.ToOneField(DiscountResource,'discount', null=True)

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
        result = super(VisitResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    def dehydrate(self, bundle):
        bundle.data['referral_name'] = bundle.obj.referral
        bundle.data['operator_name'] = bundle.obj.operator
        bundle.data['patient_name'] = bundle.obj.patient.short_name()
        bundle.data['patient_id'] = bundle.obj.patient.id
        
        return none_to_empty(bundle)
    
    class Meta:
        queryset = Visit.objects.all() #@UndefinedVariable
        resource_name = 'visit'
        authorization = DjangoAuthorization()
        filtering = {
            'patient': ALL_WITH_RELATIONS,
            'id':ALL,
            'created':ALL
        }
        

class LabOrderResource(ModelResource):
    """
    """
    visit = fields.ToOneField(VisitResource, 'visit')
    
    def dehydrate(self, bundle):
        laborder = bundle.obj
        bundle.data['lab_name'] = laborder.laboratory
        bundle.data['staff_name'] = laborder.staff and laborder.staff.short_name() or ''
        return bundle
    
    class Meta:
        queryset = LabOrder.objects.all()
        resource_name = 'laborder'
        filtering = {
            'visit': ALL_WITH_RELATIONS
        }
        

class BaseServiceResource(ModelResource):
    """
    """
    #order = fields.ToOneField(VisitResource, 'order')
    
    class Meta:
        queryset = BaseService.objects.all()
        resource_name = 'baseservice'
#        filtering = {
#        }


class PositionResource(ModelResource):
    """
    """
    def dehydrate(self, bundle):
        bundle.data['text'] = bundle.obj.__unicode__()
        return bundle
    
    class Meta:
        queryset = Position.objects.all()
        resource_name = 'position'
        limit = 100
        filtering = {
            'title':('istartswith',)
        }


class OrderedServiceResource(ModelResource):
    """
    """
    order = fields.ToOneField(VisitResource, 'order')
    service = fields.ToOneField(BaseServiceResource, 'service')
    staff = fields.ToOneField(PositionResource, 'staff', full=True, null=True)

    def dehydrate(self, bundle):
        service = bundle.obj.service
        bundle.data['service_name'] = service.short_name or service.name
        bundle.data['created'] = bundle.obj.order.created
        return bundle
    
    class Meta:
        queryset = OrderedService.objects.all()
        resource_name = 'orderedservice'
        filtering = {
            'order': ALL_WITH_RELATIONS
        }
        


class ServiceBasketResource(ExtResource):
    """
    """
    order = fields.ToOneField(VisitResource, 'order', null=True)
    service = fields.ToOneField(BaseServiceResource, 'service', null=True)
    staff = fields.ToOneField(PositionResource, 'staff', null=True)
    execution_place = fields.ToOneField(StateResource, 'execution_place')

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
        filtering = {
            'order': ALL_WITH_RELATIONS
        }
        limit = 50
        authorization = DjangoAuthorization()




api = Api(api_name='v1')
api.register(PatientResource())
api.register(VisitResource())
api.register(ReferralResource())
api.register(LabOrderResource())
api.register(OrderedServiceResource())
api.register(BaseServiceResource())
api.register(PositionResource())
api.register(ServiceBasketResource())   
api.register(LabResource())
api.register(StateResource())
api.register(DiscountResource())