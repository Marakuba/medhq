# -*- coding: utf-8 -*-

from tastypie.resources import ModelResource
from patient.models import Patient, InsurancePolicy
from visit.models import Visit, Referral, OrderedService
from tastypie import fields
from tastypie.api import Api
from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from lab.models import LabOrder, Sampling, Tube, Result, Analysis, InputList,\
    Equipment, EquipmentAssay, EquipmentResult, EquipmentTask, Invoice,\
    InvoiceItem, LabService
from service.models import BaseService, LabServiceGroup, ExtendedService, ICD10
from staff.models import Position, Staff, Doctor
from state.models import State, Department
from pricelist.models import Discount
from api.utils import none_to_empty
from api.resources import ExtResource, ComplexQuery, ExtBatchResource
from api import get_api_name
from numeration.models import BarcodePackage, NumeratorItem, Barcode
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from tastypie.exceptions import NotFound
from examination.models import CardTemplate, ExaminationCard  #, TemplateGroup
from helpdesk.models import Issue, IssueType
from scheduler.models import Calendar, Event, Preorder, getToday
from billing.models import Account, Payment, ClientAccount
from interlayer.models import ClientItem
from django.contrib.contenttypes.models import ContentType
from examination.models import TemplateGroup, DICOM, Card, Template, FieldSet,\
    SubSection, Glossary, Questionnaire
from tastypie.cache import SimpleCache
from django.contrib.auth.models import User
from examination.models import Equipment as ExamEquipment
from patient.utils import smartFilter
from django.db.models.query_utils import Q
from crm.models import AdSource
from constance import config
from promotion.models import Promotion
from remoting.models import RemoteState
from api.authorization import LocalAuthorization
from patient.models import ContractType, Contract
from scheduler.models import RejectionCause
from medstandart.models import Standart, StandartItem, Term,\
    Complications, Stage, Phase, NosologicalForm, AgeCategory
from reporting.models import Report
from medhq.apps.reporting.models import Query
from django.db.models.expressions import F
import datetime


class UserResource(ModelResource):

    class Meta:
        queryset = User.objects.select_related().all()
        limit = 1000
        resource_name = 'user'


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
            if filters['parent']=='root':
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
            'name':('istartswith',),
            'code':('istartswith',),
            'parent': ALL_WITH_RELATIONS
        }


class DiscountResource(ModelResource):

    def dehydrate(self, bundle):
        bundle.data['name'] = "%s, %s" % (bundle.obj.name, bundle.obj.value)
        return bundle
    
    class Meta:
        queryset = Discount.objects.exclude(type=u'arc') 
        resource_name = 'discount'
        limit = 100
        filtering = {
            'id': ALL,
            'name':('istartswith',)
        }

class ClientItemResource(ExtResource):
    client = fields.OneToOneField('apps.api.registry.PatientResource', 'client')
    def dehydrate(self, bundle):
        bundle.data['client_name'] = bundle.obj.client.full_name()
        return bundle
    
    class Meta:
        queryset = ClientItem.objects.all()
        resource_name = 'clientitem'
        authorization = DjangoAuthorization()
        filtering = {
            'client': ALL_WITH_RELATIONS,
        }
        
class AdSourceResource(ExtResource):
    
#    def dehydrate(self, bundle):
#        return bundle
    
    class Meta:
        queryset = AdSource.objects.all()
        resource_name = 'adsource'
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'id': ALL,
            'name': ALL,
        }
        
class PatientResource(ExtResource):
    
    ad_source = fields.ForeignKey(AdSourceResource, 'ad_source', null=True)
    discount = fields.ForeignKey(DiscountResource, 'discount', null=True)
    state = fields.ForeignKey('api.registry.StateResource', 'state', null=True)
    client_item = fields.OneToOneField(ClientItemResource, 'client_item', null=True)
    
    def hydrate_initial_account(self, bundle):
#TODO: only for Python 2.6 trick. Will be remove later.
        try:
            bundle.data['initial_account'] = str(bundle.data['initial_account'])
        except KeyError:
            pass
        return bundle
    
    def hydrate_billed_account(self, bundle):
#TODO: only for Python 2.6 trick. Will be remove later.
        try:
            bundle.data['billed_account'] = str(bundle.data['billed_account'])
        except KeyError:
            pass
        return bundle
    
    def dehydrate(self, bundle):
        active_state = bundle.request.active_profile.department.state
        bundle.data['accepted'] = bundle.obj.get_accepted_date(active_state)
        bundle.data['discount_name'] = bundle.obj.discount and bundle.obj.discount or u'0%'
        bundle.data['full_name'] = bundle.obj.full_name()
        bundle.data['short_name'] = bundle.obj.short_name()
        bundle.data['ad_source_name'] = bundle.obj.ad_source and bundle.obj.ad_source or u''
        bundle.data['lat'] = bundle.obj.translify()
        bundle.data['contract'] = bundle.obj.get_contract()
        return bundle

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        kwargs['state'] = request.active_profile and request.active_profile.department.state or None
        result = super(PatientResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(PatientResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'])
            if len(smart_filters.keys()) == 1:
                try:
                    orm_filters = ComplexQuery(Q(visit__barcode__id=int(filters['search'])) | Q(**smart_filters), \
                                      **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)
            
        return orm_filters

    class Meta:
        queryset = Patient.objects.select_related().all()
        resource_name = 'patient'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        caching = SimpleCache()
        always_return_data = True
        filtering = {
            'last_name': ('istartswith',),
            'first_name': ('istartswith',),
            'birth_day': ALL_WITH_RELATIONS,
            'id': ALL,
            'full_name': ('istartswith',),
            'discount': ALL_WITH_RELATIONS,
            'state': ALL_WITH_RELATIONS
        }

class ContractTypeResource(ExtResource):
    class Meta:
        queryset = ContractType.objects.all() #@UndefinedVariable
        resource_name = 'contracttype'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'type':('istartswith',),
            'title': ALL,
            'validity': ALL,
            'id': ALL
        }
    
        
class ContractResource(ExtResource):
    patient = fields.ForeignKey(PatientResource, 'patient')
    state = fields.ForeignKey('api.registry.OwnStateResource', 'state', null = True)
    contract_type = fields.ForeignKey(ContractTypeResource, 'contract_type', null = True)
    
    def dehydrate(self, bundle):
        bundle.data['name'] = bundle.obj.__unicode__()
        bundle.data['state_name'] = bundle.obj.state and bundle.obj.state.name
        bundle.data['contract_type_name'] = bundle.obj.contract_type and bundle.obj.contract_type.title
        bundle.data['template'] = bundle.obj.contract_type and bundle.obj.contract_type.template
        return bundle
    
    class Meta:
        queryset = Contract.objects.select_related().all().order_by('created')
        resource_name = 'contract'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'patient': ALL_WITH_RELATIONS,
            'state': ALL_WITH_RELATIONS,
            'contract_type': ALL_WITH_RELATIONS,
            'active': ALL,
            'id': ALL
        }
        
class DebtorResource(ExtResource):
    
    discount = fields.ForeignKey(DiscountResource, 'discount', null=True)
    client_item = fields.OneToOneField(ClientItemResource, 'client_item', null=True)
    
    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(DebtorResource, self).build_filters(filters)

        if "visit_id" in filters:
            visit = get_object_or_404(Visit, barcode__id=filters['visit_id'])

            orm_filters = {"pk__exact": visit.patient.id }
            
        if "search" in filters:

            orm_filters.update(smartFilter(filters['search']))

        return orm_filters
    
    class Meta:
        queryset = Patient.objects.filter(balance__lt = 0) #@UndefinedVariable
        resource_name = 'debtor'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        filtering = {
            'last_name':('istartswith',),
            'id': ALL,
            'discount': ALL_WITH_RELATIONS,
            'hid_card': ALL
        }
        
class DepositorResource(ExtResource):
    
    discount = fields.ForeignKey(DiscountResource, 'discount', null=True)
    client_item = fields.OneToOneField(ClientItemResource, 'client_item', null=True)
    
    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(DepositorResource, self).build_filters(filters)

        if "visit_id" in filters:
            visit = get_object_or_404(Visit, barcode__id=filters['visit_id'])

            orm_filters = {"pk__exact": visit.patient.id }
            
        if "search" in filters:

            orm_filters.update(smartFilter(filters['search']))

        return orm_filters
    
    class Meta:
        queryset = Patient.objects.filter(balance__gt = 0) #@UndefinedVariable
        resource_name = 'depositor'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        filtering = {
            'last_name':('istartswith',),
            'id': ALL,
            'discount': ALL_WITH_RELATIONS,
            'hid_card': ALL
        }
        
class ReferralResource(ExtResource):

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
        result = super(ReferralResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result
    def dehydrate(self, bundle):
        bundle.data['referral_type_name'] = bundle.obj.get_referral_type_display()
        return bundle

    class Meta:
        queryset = Referral.objects.all() #@UndefinedVariable
        resource_name = 'referral'
        always_return_data = True
        limit = 200
        authorization = DjangoAuthorization()
        filtering = {
            'name':('istartswith',),
            'id': ALL
        }
        

        
class LabResource(ModelResource):

    class Meta:
        queryset = State.objects.select_related().filter(type__in=('m', 'b', 'p')).exclude(id=config.MAIN_STATE_ID) 
        resource_name = 'lab'
        limit = 10
        filtering = {
            'id': ALL,
            'name':('istartswith',)
        }
        

class MedStateResource(ModelResource):

    class Meta:
        queryset = State.objects.select_related().filter(type__in=('m', 'b', 'p')).order_by('type', 'id',)
        caching = SimpleCache()
        resource_name = 'medstate'
        limit = 20
        filtering = {
            'id': ALL,
            'name':('istartswith',)
        }
        

class OwnStateResource(ModelResource):

    class Meta:
        queryset = State.objects.select_related().filter(type__in=('b', 'p')).order_by('id',)
        caching = SimpleCache()
        resource_name = 'ownstate'
        limit = 20
        filtering = {
            'id': ALL,
            'name':('istartswith',)
        }

class RemoteStateResource(ModelResource):
    
    state = fields.ForeignKey('apps.api.registry.StateResource', 'state')
    
    class Meta:
        queryset = RemoteState.objects.all()
        resource_name = 'remotestate'
        filtering = {
            'id': ALL
        }

class StateResource(ModelResource):
    
    remotestate = fields.OneToOneField(RemoteStateResource, 'remotestate', null=True)

    class Meta:
        queryset = State.objects.all() 
        resource_name = 'state'
        limit = 10
        filtering = {
            'id': ALL,
            'type': ALL,
            'name': ALL,
            'uuid': ALL,
            'remotestate': ALL_WITH_RELATIONS
        }
        
        
class LabServiceGroupResource(ModelResource):
    
    class Meta:
        queryset = LabServiceGroup.objects.all() 
        resource_name = 'labgroup'
        limit = 10
        filtering = {
            'name':('istartswith',)
        }
        
        
class InsuranceStateResource(ExtResource):

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['type']=u'i'
        kwargs['print_name']=bundle.data['name']
        kwargs['official_title']=bundle.data['name']
        result = super(InsuranceStateResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    class Meta:
        queryset = State.objects.filter(type='i') 
        resource_name = 'insurance_state'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 50
        filtering = {
            'name':('istartswith',)
        }
        
class InsurancePolicyResource(ExtResource):
    
    insurance_state = fields.ForeignKey(InsuranceStateResource, 'insurance_state')
    patient = fields.ForeignKey(PatientResource, 'patient')

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        result = super(InsurancePolicyResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    def dehydrate(self, bundle):
        bundle.data['state_name'] = bundle.obj.insurance_state
        bundle.data['name'] = bundle.obj
        return bundle
    
    class Meta:
        queryset = InsurancePolicy.objects.all() 
        resource_name = 'insurance_policy'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 50
        filtering = {
            'id': ALL,
            'patient': ALL_WITH_RELATIONS,
            'insurance_state': ALL_WITH_RELATIONS
        }
        

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


class VisitResource(ExtResource):
    patient = fields.ToOneField(PatientResource, 'patient', null=True)
    office = fields.ToOneField(StateResource, 'office', null=True)
    referral = fields.ToOneField(ReferralResource, 'referral', null=True)
    source_lab = fields.ToOneField(LabResource, 'source_lab', null=True)
    payer = fields.ToOneField(StateResource, 'payer', null=True)
    discount = fields.ToOneField(DiscountResource, 'discount', null=True)
    barcode = fields.ForeignKey(BarcodeResource, 'barcode', null=True)
    insurance_policy = fields.ToOneField(InsurancePolicyResource, 'insurance_policy', null=True)
    contract = fields.ForeignKey(ContractResource, 'contract', null=True)

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
        kwargs['office']=request.active_profile.department.state
        result = super(VisitResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    def dehydrate(self, bundle):
        bundle.data['referral_name'] = bundle.obj.referral
        bundle.data['operator_name'] = bundle.obj.operator
        bundle.data['discount_value'] = bundle.obj.discount and int(bundle.obj.discount.value) or 0
        bundle.data['patient_name'] = bundle.obj.patient.short_name()
        bundle.data['office_name'] = bundle.obj.office
        bundle.data['payer_name'] = bundle.obj.payer and bundle.obj.payer.name or '' 
        bundle.data['patient_id'] = bundle.obj.patient.id
        bundle.data['barcode_id'] = bundle.obj.barcode.id
        
        return none_to_empty(bundle)
    
    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(VisitResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'patient')
            if len(smart_filters.keys())==1:
                try:
                    orm_filters = ComplexQuery( Q(barcode__id=int(filters['search'])) | Q(**smart_filters), \
                                      **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)

#            orm_filters.update(smartFilter(filters['search'], 'patient'))


        return orm_filters
    
    class Meta:
        queryset = Visit.objects.select_related().filter(cls__in=(u'п',u'б'))
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
            'office': ALL_WITH_RELATIONS
        }
        
class RefundResource(ExtResource):
    patient = fields.ToOneField(PatientResource, 'patient', null=True)
    office = fields.ToOneField(StateResource, 'office', null=True)
    referral = fields.ToOneField(ReferralResource, 'referral', null=True)
    source_lab = fields.ToOneField(LabResource, 'source_lab', null=True)
    discount = fields.ToOneField(DiscountResource, 'discount', null=True)
    insurance_policy = fields.ToOneField(InsurancePolicyResource, 'insurance_policy', null=True)

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
        kwargs['office']=request.active_profile.department.state
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
        

class LabOrderResource(ExtResource):
    """
    """
    visit = fields.ToOneField(VisitResource, 'visit', null=True)
    laboratory = fields.ForeignKey(MedStateResource, 'laboratory', null=True)
#    lab_group = fields.ForeignKey(LabServiceGroupResource, 'lab_group', null=True)
    staff = fields.ForeignKey('api.registry.PositionResource', 'staff', null=True)

    def dehydrate(self, bundle):
        laborder = bundle.obj
        bundle.data['laboratory_name'] = laborder.laboratory
        v = laborder.visit
        if v:
            info = []
            if v.pregnancy_week:
                info.append(u"Б: <font color='red'>%s</font>" % v.pregnancy_week)
            if v.menses_day:
                info.append(u"Д/ц: <font color='red'>%s</font>" % v.menses_day)
            bundle.data['info'] = "; ".join(info)
            bundle.data['visit_created'] = v.created
            bundle.data['visit_is_cito'] = v.is_cito
            bundle.data['visit_id'] = v.id
            bundle.data['barcode'] = v.barcode.id
            bundle.data['is_male'] = v.patient.gender == u'М'
            bundle.data['patient_name'] = v.patient.full_name()
            bundle.data['payer_name'] = v.payer and v.payer.name or ''
            bundle.data['patient_age'] = v.patient.full_age()
            bundle.data['lat'] = v.patient.translify()
            bundle.data['operator_name'] = v.operator
            bundle.data['office_name'] = v.office
        bundle.data['staff_name'] = laborder.staff and laborder.staff.staff.short_name() or ''
        return bundle
    
    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(LabOrderResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'visit__patient')
            if len(smart_filters.keys())==1:
                try:
                    cond = Q(**smart_filters)
                    if filters['search'].startswith('!'):
                        cond |= Q(visit__specimen=filters['search'][1:])
                    else:
                        cond |= Q(visit__barcode__id=int(filters['search']))
                        
                    orm_filters = ComplexQuery( cond , \
                                      **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)

#            orm_filters.update(smartFilter(filters['search'], 'visit__patient'))


        return orm_filters
    
    class Meta:
        queryset = LabOrder.objects.select_related().all()
        resource_name = 'laborder'
        authorization = DjangoAuthorization()
        always_return_data = True
        caching = SimpleCache()
        limit = 100
        filtering = {
            'id': ALL,
            'created': ALL_WITH_RELATIONS,
            'visit': ALL_WITH_RELATIONS,
            'staff': ALL_WITH_RELATIONS,
            'laboratory': ALL_WITH_RELATIONS,
            'lab_group': ALL_WITH_RELATIONS,
            'is_completed': ALL,
            'is_printed': ALL,
            'is_manual': ALL
        }
        
class LSResource(ExtResource):
    
    class Meta:
        queryset = LabService.objects.all()
        authorization = DjangoAuthorization()
        resource_name = 'ls'
        filtering = {
            'is_manual': ALL,
        }
        
class BaseServiceResource(ExtResource):
    """
    """
    parent = fields.ForeignKey('self', 'parent', null=True)
    labservice = fields.ForeignKey(LSResource, 'labservice', null=True)
    
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

lookups = {}
lookups[BaseService._meta.right_attr] = F(BaseService._meta.left_attr)+1


class BaseServiceGroupResource(ExtResource):
    parent = fields.ForeignKey('self', 'parent', null=True)
    labservice = fields.ForeignKey(LSResource, 'labservice', null=True)
    
    def dehydrate(self, bundle):
        service = bundle.obj
        bundle.data['name'] = '-'*service.level + service.name
        return bundle
    
    class Meta:
        queryset = BaseService.objects.exclude(**lookups).order_by(BaseService._meta.tree_id_attr, BaseService._meta.left_attr, 'level')
        authorization = DjangoAuthorization()
        always_return_data = True
        resource_name = 'baseservicegroup'
        filtering = {
            'id': ALL,
            'name': ALL,
            'parent': ALL_WITH_RELATIONS,
            'labservice': ALL_WITH_RELATIONS
        }
        
class StaffResource(ModelResource):
    referral = fields.ForeignKey(ReferralResource, 'referral', null = True)
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
            if len(smart_filters.keys())==1:
                try:
                    orm_filters = ComplexQuery( Q(visit__barcode__id=int(filters['search'])) | Q(**smart_filters), \
                                      **orm_filters)
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
            'last_name':('istartswith',),
            'id': ALL,
            'status': ALL
        }

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
            if len(smart_filters.keys())==1:
                try:
                    orm_filters = ComplexQuery( Q(visit__barcode__id=int(filters['search'])) | Q(**smart_filters), \
                                      **orm_filters)
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
            'title':('istartswith',),
            'staff': ALL_WITH_RELATIONS,
        }

class ExtendedServiceResource(ModelResource):
    """
    """
    base_service = fields.ForeignKey(BaseServiceResource, 'base_service')
    staff = fields.ManyToManyField(PositionResource, 'staff', null=True)
    state = fields.ForeignKey(StateResource, 'state')
    
    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(ExtendedServiceResource, self).build_filters(filters)

        if "payment_type" in filters:
            setattr(self, 'ptype',filters['payment_type'])
        if "on_date" in filters:
            on_date = datetime.datetime.strptime(filters['on_date'], '%Y-%m-%dT%H:%M:%S')
            setattr(self, 'on_date',on_date)

        return orm_filters

    def dehydrate(self, bundle):
        ptype = getattr(self, 'ptype',u'н')
        on_date = getattr(self, 'on_date',None)
        print on_date
        bundle.data['staff'] = bundle.obj.staff and [[staff.id,staff] for staff in bundle.obj.staff.all()] or None
        bundle.data['state_name'] = bundle.obj.state.name
        bundle.data['service_name'] = bundle.obj.base_service.name
        bundle.data['price'] = bundle.obj.get_actual_price(date=on_date,payment_type=ptype)
        return bundle
    
    class Meta:
        queryset = ExtendedService.objects.filter(is_active=True).select_related()
        resource_name = 'extendedservice'
        always_return_data = True
        filtering = {
            'id': ALL,
            'base_service': ALL_WITH_RELATIONS,
            'state': ALL_WITH_RELATIONS,
            'staff': ALL_WITH_RELATIONS,
            'name': ALL,
            'is_active': ALL
        }



class AnalysisResource(ModelResource):
    """
    """
    service = fields.ForeignKey(BaseServiceResource, 'service')
    
    class Meta:
        queryset = Analysis.objects.select_related().all()
        resource_name = 'analysis'
        always_return_data = True
        filtering = {
            'service': ALL_WITH_RELATIONS
        }

class ResultResource(ExtResource):
    """
    """
    order = fields.ForeignKey(LabOrderResource, 'order')
    analysis = fields.ForeignKey(AnalysisResource, 'analysis')
    modified_by = fields.ForeignKey(UserResource, 'modified_by', null=True)
    sample = fields.ForeignKey('api.registry.SamplingResource', 'sample', null=True)
    
    def obj_update(self, bundle, request=None, **kwargs):
        kwargs['modified_by']=request.user
        result = super(ResultResource, self).obj_update(bundle=bundle, request=request, **kwargs)
        return result
    
    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle.data['barcode'] = obj.order.visit.barcode.id
        bundle.data['patient'] = obj.order.visit.patient.full_name()
        bundle.data['service_name'] = obj.analysis.service
        bundle.data['laboratory'] = obj.order.laboratory
        bundle.data['is_group'] = obj.is_group()
        bundle.data['analysis_name'] = obj.__unicode__()
        bundle.data['analysis_code'] = obj.analysis.code
        bundle.data['inputlist'] = [[input.name] for input in obj.analysis.input_list.all()]
        bundle.data['measurement'] = obj.analysis.measurement
        bundle.data['modified_by_name'] = obj.modified_by
        return bundle
    
    class Meta:
        queryset = Result.objects.active().select_related()
        authorization = DjangoAuthorization()
        resource_name = 'result'
        always_return_data = True
        limit = 100
        filtering = {
            'order': ALL_WITH_RELATIONS,
            'analysis': ALL_WITH_RELATIONS,
            'is_validated': ALL,
        }
        

class InputListResource(ModelResource):
    """
    """
    
    class Meta:
        queryset = InputList.objects.all()
        resource_name = 'inputlist'
        filtering = {
            'name': ALL
        }


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
        queryset = Staff.objects.filter(doctor__isnull = False,status=u'д')
        resource_name = 'staffsched'
        always_return_data = True
        limit = 100
        filtering = {
            'last_name':('istartswith',),
            'id': ALL
        }

class DepartmentResource(ExtResource):
    """
    """
    state = fields.ToOneField(StateResource, 'state')
    
    def dehydrate(self, bundle):
        bundle.data['title'] = bundle.obj.__unicode__()
        return bundle
        
    class Meta:
        queryset = Department.objects.all()
        resource_name = 'department'
        limit = 100
        filtering = {
            'id': ALL,
            'name': ALL,
        }
        
class PosSchedResource(ModelResource):
    """
    """
    #doctor = fields.ToOneField(DoctorResource, 'doctor', null=True)
    department = fields.ForeignKey(DepartmentResource, 'department', null=True)
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
        queryset = Position.objects.filter(staff__doctor__isnull = False)
        resource_name = 'possched'
        always_return_data = True
        limit = 100
        filtering = {
            'last_name':('istartswith',),
            'id': ALL,
            'is_active': ALL,
            'staff': ALL_WITH_RELATIONS
        }

class TubeResource(ModelResource):
    """
    """
    class Meta:
        queryset = Tube.objects.all()
        resource_name = 'tube'
        filtering = {
            'name': ALL
        }

#class AnalysisResource(ModelResource):
#    """
#    """
#    class Meta:
#        queryset = Analysis.objects.all()
#        resource_name = 'analysis'
#        filtering = {
#            'name': ALL
#        }


class NumeratorItemResource(ModelResource):
    """
    """
    class Meta:
        queryset = NumeratorItem.objects.all()
        resource_name = 'numerator'
        filtering = {
        }


class SamplingResource(ExtResource):
    """
    """
    visit = fields.ForeignKey(VisitResource, 'visit')
    laboratory = fields.ForeignKey(StateResource, 'laboratory')
    tube = fields.ForeignKey(TubeResource, 'tube')
    number = fields.ForeignKey(NumeratorItemResource, 'number', null=True)

    def obj_delete(self, request=None, **kwargs):
        sampling_pk = kwargs['pk']
        OrderedService.objects.filter(sampling__pk=sampling_pk).update(sampling=None)
        result = super(SamplingResource, self).obj_delete(request=request, **kwargs)
        return result

    def dehydrate(self, bundle):
        bundle.data['tube_type'] = bundle.obj.tube
#        bundle.data['services'] = [item.service.__unicode__() for item in bundle.obj.get_services()]
        return bundle

    class Meta:
        queryset = Sampling.objects.all()
        authorization = DjangoAuthorization()
        resource_name = 'sampling'
        always_return_data = True
        limit = 100
        filtering = {
            'visit': ALL_WITH_RELATIONS,
            'laboratory': ALL_WITH_RELATIONS,
            'number': ALL_WITH_RELATIONS
        }


class BarcodedSamplingResource(ModelResource):
    """
    """
    visit = fields.ForeignKey(VisitResource, 'visit')
    laboratory = fields.ForeignKey(StateResource, 'laboratory')
    tube = fields.ForeignKey(TubeResource, 'tube')
    number = fields.ForeignKey(NumeratorItemResource, 'number', null=True)
    
    def dehydrate(self, bundle):
        bundle.data['tube_type'] = bundle.obj.tube
        bundle.data['bc_count'] = bundle.obj.tube.bc_count
        bundle.data['services'] = [item.service.__unicode__() for item in bundle.obj.get_services()]
        return bundle
    
    class Meta:
        queryset = Sampling.objects.filter(number__isnull=True)
        resource_name = 'bc_sampling'
        always_return_data = True
        limit = 100
        filtering = {
            'visit': ALL_WITH_RELATIONS,
            'laboratory': ALL_WITH_RELATIONS
        }


class OrderedServiceResource(ExtBatchResource):
    """
    """
    order = fields.ToOneField(VisitResource, 'order')
    service = fields.ToOneField(BaseServiceResource, 'service')
    staff = fields.ToOneField(PositionResource, 'staff', full=True, null=True)
    sampling = fields.ForeignKey(SamplingResource, 'sampling', null=True)
    execution_place = fields.ForeignKey(StateResource, 'execution_place')
    assigment = fields.ForeignKey('apps.api.registry.PreorderResource', 'assigment', null=True)

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
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
        bundle.data['barcode'] = bundle.obj.order.barcode.id
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
        

class LabOrderedServiceResource(OrderedServiceResource):
    
    def dehydrate(self, bundle):
        o = bundle.obj
        service = o.service
        bundle.data['service_name'] = service.short_name or service.name
        bundle.data['service_full_name'] = service.name
        bundle.data['created'] = bundle.obj.order.created
        bundle.data['visit_id'] = bundle.obj.order.id
        bundle.data['barcode'] = bundle.obj.order.barcode.id
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
            if len(smart_filters.keys())==1:
                try:
                    orm_filters = ComplexQuery( Q(order__barcode__id=int(filters['search'])) | Q(**smart_filters), \
                                      **orm_filters)
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


class LabServiceResource(ExtResource):
    """
    """
    order = fields.ToOneField(VisitResource, 'order')
    service = fields.ToOneField(BaseServiceResource, 'service')
    staff = fields.ToOneField(PositionResource, 'staff', null=True)

    def dehydrate(self, bundle):
        service = bundle.obj.service
        bundle.data['staff_name'] = bundle.obj.staff and bundle.obj.staff.short_name() or ''
        bundle.data['service_name'] = service.short_name or service.name
        bundle.data['service_code'] = service.labservice and service.labservice.code or ''
        bundle.data['patient_name'] = bundle.obj.order.patient.full_name()
        bundle.data['operator_name'] = bundle.obj.order.operator
        bundle.data['office_name'] = bundle.obj.order.office
        bundle.data['laboratory'] = bundle.obj.execution_place
        bundle.data['barcode'] = bundle.obj.order.barcode.id
        return bundle
    
    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(LabServiceResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'order__patient')
            if len(smart_filters.keys())==1:
                try:
                    orm_filters = ComplexQuery( Q(order__barcode__id=int(filters['search'])) | Q(**smart_filters), \
                                      **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)
            
        return orm_filters

    class Meta:
        queryset = OrderedService.objects.filter(service__labservice__is_manual=True) #all lab services
        resource_name = 'labservice'
        always_return_data = True
        authorization = DjangoAuthorization()
        limit = 50
        filtering = {
            'created': ALL_WITH_RELATIONS,
            'order': ALL_WITH_RELATIONS,
            'staff': ALL_WITH_RELATIONS,
        }
        
        
class LabTestResource(ExtResource):
    """
    """
    order = fields.ToOneField(VisitResource, 'order')
    execution_place = fields.ToOneField(StateResource, 'execution_place')
    service = fields.ToOneField(BaseServiceResource, 'service')
    staff = fields.ToOneField(PositionResource, 'staff', null=True)
    #sampling = fields.ForeignKey(SamplingResource, 'sampling', null=True)

    def dehydrate(self, bundle):
        service = bundle.obj.service
        order = bundle.obj.order
        patient = order.patient
        bundle.data['service_name'] = service.short_name or service.name
        bundle.data['service_full_name'] = service.name
#        bundle.data['lab_group'] = service.lab_group
        bundle.data['created'] = order.created
        bundle.data['printed'] = bundle.obj.print_date
        bundle.data['barcode'] = order.barcode.id
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
        queryset = OrderedService.objects.select_related().filter(service__lab_group__isnull=False).order_by('service', '-created') #all lab services
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
        
        
class ExamServiceResource(ExtResource):
    """
    """
    order = fields.ToOneField(VisitResource, 'order')
    execution_place = fields.ToOneField(StateResource, 'execution_place')
    service = fields.ToOneField(BaseServiceResource, 'service')
    staff = fields.ToOneField(PositionResource, 'staff', null=True)
    sampling = fields.ForeignKey(SamplingResource, 'sampling', null=True)

    def dehydrate(self, bundle):
        service = bundle.obj.service
        bundle.data['service_name'] = service.short_name or service.name
        bundle.data['service_full_name'] = service.name
        #bundle.data['lab_group'] = service.lab_group
        bundle.data['created'] = bundle.obj.order.created
        bundle.data['printed'] = bundle.obj.print_date
        bundle.data['barcode'] = bundle.obj.order.barcode.id
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
        filtering = {
            'id': ALL,
            'order': ALL_WITH_RELATIONS,
            'sampling': ALL_WITH_RELATIONS,
            'staff': ALL_WITH_RELATIONS,
            'execution_place': ALL_WITH_RELATIONS,
            'executed': ALL,
            'created': ALL
        }

class SamplingServiceResource(ExtResource):
    """
    """
    order = fields.ToOneField(VisitResource, 'order')
    service = fields.ToOneField(BaseServiceResource, 'service')
    staff = fields.ToOneField(PositionResource, 'staff', full=True, null=True)
    sampling = fields.ForeignKey(SamplingResource, 'sampling', null=True)

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
        bundle.data['barcode'] = bundle.obj.order.barcode.id
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
        


class ServiceBasketResource(ExtBatchResource):
    """
    """
    order = fields.ToOneField(VisitResource, 'order', null=True)
    service = fields.ToOneField(BaseServiceResource, 'service', null=True)
    staff = fields.ToOneField(PositionResource, 'staff', null=True)
    execution_place = fields.ToOneField(StateResource, 'execution_place')
    assigment = fields.ForeignKey('apps.api.registry.PreorderResource', 'assigment', null=True)

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
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
        

class RefundBasketResource(ExtResource):
    """
    """
    order = fields.ToOneField(RefundResource, 'order', null=True)
    service = fields.ToOneField(BaseServiceResource, 'service', null=True)
    staff = fields.ToOneField(PositionResource, 'staff', null=True)
    execution_place = fields.ToOneField(StateResource, 'execution_place')

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
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


class BCPackageResource(ExtResource):
    """
    """
    laboratory = fields.ForeignKey(StateResource, 'laboratory')

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
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


class ExamEquipmentResource(ExtResource):
    class Meta:
        queryset = ExamEquipment.objects.all()
#        authorization = DjangoAuthorization()
        resource_name = 'exam_equipment'
        filtering = {
            'name': ALL,
            'id': ALL
        }


class TemplateGroupResource(ExtResource):
    
    equipment = fields.ForeignKey(ExamEquipmentResource, 'equipment', null=True)
    
    class Meta:
        queryset = TemplateGroup.objects.all()
        authorization = DjangoAuthorization()
        resource_name = 'templategroup'
        filtering = {
            'name': ALL,
            'id': ALL
        }

class CardTemplateResource(ExtResource):

    staff = fields.ForeignKey(PositionResource, 'staff', null=True)
    group = fields.ForeignKey(TemplateGroupResource, 'group', null=True)
    mbk_diag = fields.ForeignKey(ICD10Resource, 'mbk_diag', null=True)
    equipment = fields.ForeignKey(ExamEquipmentResource, 'equipment', null=True)
    
    def dehydrate(self, bundle):
        obj = bundle.obj
        if obj.staff:
            bundle.data['staff_name'] = obj.staff.__unicode__()
        bundle.data['group_name'] = obj.group and obj.group.name or u'Без группы'
        return bundle
    
    class Meta:
        queryset = CardTemplate.objects.all()
        always_return_data = True
        resource_name = 'cardtemplate'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        filtering = {
            'name': ALL,
            'staff': ALL_WITH_RELATIONS,
            'id': ALL
        }
        limit = 150
        
class ExaminationCardResource(ExtResource):
    
    assistant = fields.ForeignKey(PositionResource, 'assistant', null=True)
    ordered_service = fields.ForeignKey(OrderedServiceResource, 'ordered_service', null=True)
    mbk_diag = fields.ForeignKey(ICD10Resource, 'mbk_diag', null=True)
    equipment = fields.ForeignKey(ExamEquipmentResource, 'equipment', null=True)
    
    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle.data['name'] = obj.print_name or obj.ordered_service.service
        bundle.data['assistant_name'] = obj.assistant and obj.assistant or u''
        bundle.data['view'] = obj.__unicode__()
        bundle.data['staff_id'] = obj.ordered_service.staff.id
        return bundle
    
    class Meta:
        queryset = ExaminationCard.objects.all()
        resource_name = 'examcard'
        always_return_data = True
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        filtering = {
            'ordered_service': ALL_WITH_RELATIONS,
            'id': ALL,
            'name': ALL
        }
        #limit = 1000
        
class CardResource(ExtResource):
    
    ordered_service = fields.ForeignKey(OrderedServiceResource, 'ordered_service', null=True)
    assistant = fields.ForeignKey(PositionResource, 'assistant', null = True)
    mkb_diag = fields.ForeignKey(ICD10Resource, 'mkb_diag', null=True)
    equipment = fields.ForeignKey(ExamEquipmentResource, 'equipment', null=True)
    
    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(CardResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'ordered_service__order__patient')
            if len(smart_filters.keys())==1:
                try:
                    orm_filters = ComplexQuery( Q(**smart_filters), \
                                      **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)

        return orm_filters

    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle.data['view'] = obj.__unicode__()
        bundle.data['patient_id'] = obj.ordered_service.order.patient.id
        bundle.data['patient_name'] = obj.ordered_service.order.patient.short_name()
        bundle.data['staff_id'] = obj.ordered_service.staff and obj.ordered_service.staff.id
        bundle.data['staff_name'] = obj.ordered_service.staff and obj.ordered_service.staff
        bundle.data['executed'] = obj.ordered_service.executed and True or False
        bundle.data['assistant_name'] = obj.assistant and obj.assistant.staff.short_name() or ''
        return bundle
    
    class Meta:
        queryset = Card.objects.all().select_related()
        resource_name = 'card'
        default_format = 'application/json'
        always_return_data = True
        authorization = DjangoAuthorization()
        filtering = {
            'ordered_service': ALL_WITH_RELATIONS,
            'id': ALL,
            'created': ALL,
            'deleted': ALL,
            'name': ALL
        }
        
class TemplateResource(ExtResource):
    
    base_service = fields.ForeignKey(BaseServiceResource, 'base_service', null=True)
    staff = fields.ForeignKey(StaffResource, 'staff', null=True)
    equipment = fields.ForeignKey(ExamEquipmentResource, 'equipment', null=True)
    
    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle.data['service_name'] = obj.base_service and obj.base_service.name
        return bundle
    
    class Meta:
        queryset = Template.objects.all()
        resource_name = 'examtemplate'
        default_format = 'application/json'
        always_return_data = True
        authorization = DjangoAuthorization()
        filtering = {
            'base_service': ALL_WITH_RELATIONS,
            'id': ALL,
            'print_name': ALL,
            'deleted': ALL,
            'staff': ALL_WITH_RELATIONS
        }
        limit = 150
        
class FieldSetResource(ExtResource):
    
    class Meta:
        queryset = FieldSet.objects.all().order_by('order')
        resource_name = 'examfieldset'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        filtering = {
            'name': ALL,
            'order': ALL
        }
        
class SubSectionResource(ExtResource):
    section = fields.ForeignKey(FieldSetResource, 'section')
    
    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle.data['section_name'] = obj.section.name
        return bundle
    
    class Meta:
        queryset = SubSection.objects.all().order_by('section')
        resource_name = 'examsubsection'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        filtering = {
            'section': ALL_WITH_RELATIONS,
            'order': ALL
        }
        
class GlossaryResource(ExtResource):
    
    base_service = fields.ForeignKey(BaseServiceResource, 'base_service', null=True)
    staff = fields.ForeignKey(StaffResource, 'staff', null=True)
    parent = fields.ForeignKey('self', 'parent', null=True)
    
    def dehydrate(self, bundle):
        bundle.data['parent'] =  bundle.obj.parent and bundle.obj.parent.id
        if bundle.obj.is_leaf_node():
            bundle.data['leaf'] = bundle.obj.is_leaf_node()
        return bundle
    

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(GlossaryResource, self).build_filters(filters)

        if "parent" in filters:
            if filters['parent']=='root':
                del orm_filters['parent__exact']
                orm_filters['parent__isnull'] = True

        return orm_filters
    
    class Meta:
        queryset = Glossary.objects.all()
        resource_name = 'glossary'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'base_service': ALL_WITH_RELATIONS,
            'staff': ALL_WITH_RELATIONS,
            'id': ALL,
            'text': ALL,
            'parent': ALL,
            'section': ALL
        }
        limit = 1000
        
        
class RegExamCardResource(ExtResource):
    ordered_service = fields.ForeignKey(OrderedServiceResource, 'ordered_service', null=True)
    
    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle.data['staff_name'] = obj.ordered_service.staff.__unicode__()
        bundle.data['ordered_service_id'] = obj.ordered_service.id
        return bundle
    
    class Meta:
        queryset = ExaminationCard.objects.all()
        resource_name = 'regexamcard'
        default_format = 'application/json'
        always_return_data = True
        authorization = DjangoAuthorization()
        filtering = {
            'ordered_service': ALL_WITH_RELATIONS,
            'id': ALL
        }

from sorl.thumbnail import get_thumbnail

class DicomResource(ExtResource):
    
    examination_card = fields.ForeignKey(ExaminationCardResource, 'examination_card')

    def dehydrate(self, bundle):
        bundle.data['photo'] = bundle.obj.get_image_url() 
        bundle.data['thumb'] = get_thumbnail(bundle.obj.get_image_url(),"100x100",crop="center").url
        return bundle

    class Meta:
        queryset = DICOM.objects.all()
#        authorization = DjangoAuthorization()
        resource_name = 'dicom'
        filtering = {
            'examination_card': ALL_WITH_RELATIONS,
            'id': ALL
        }


class EquipmentResource(ExtResource):
    
    class Meta:
        queryset = Equipment.objects.all()
        resource_name = 'equipment'
        authorization = DjangoAuthorization()
        filtering = {
            'name': ALL,
            'slug': ALL,
            'serial_number': ALL
        }        

class EquipmentAssayResource(ExtResource):
    
    equipment = fields.ForeignKey(EquipmentResource, 'equipment')
    service = fields.ForeignKey(BaseServiceResource, 'service', null=True)
    
    def dehydrate(self, bundle):
        bundle.data['equipment_name'] = bundle.obj.equipment
        bundle.data['service_name'] = bundle.obj.equipment_analysis
        return bundle
    
    class Meta:
        queryset = EquipmentAssay.objects.select_related().all().order_by('service__name',)
        resource_name = 'equipmentassay'
        limit = 50
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'equipment': ALL_WITH_RELATIONS,
            'service': ALL_WITH_RELATIONS,
        }        

class EquipmentTaskReadOnlyResource(ExtBatchResource):
    
    equipment_assay = fields.ForeignKey(EquipmentAssayResource, 'equipment_assay')
    ordered_service = fields.ForeignKey(OrderedServiceResource, 'ordered_service')
    
    def dehydrate(self, bundle):
        bundle.data['assay_code'] = bundle.obj.equipment_assay.code
        bundle.data['assay_name'] = bundle.obj.equipment_assay.name
        bundle.data['status_name'] = bundle.obj.get_status_display()
        bundle.data['equipment_name'] = bundle.obj.equipment_assay.equipment
        bundle.data['service_name'] = bundle.obj.ordered_service.service.short_name
        bundle.data['analysis_name'] = bundle.obj.equipment_assay.equipment_analysis
        bundle.data['patient_name'] = bundle.obj.ordered_service.order.patient.short_name()
        bundle.data['order'] = bundle.obj.ordered_service.order.barcode.id
        bundle.data['result'] = bundle.obj.result and bundle.obj.result.get_full_result() or u''
        return bundle
    
    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(EquipmentTaskReadOnlyResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'ordered_service__order__patient')
            if len(smart_filters.keys())==1:
                try:
                    orm_filters = ComplexQuery( Q(ordered_service__order__barcode__id=int(filters['search'])) | Q(**smart_filters), \
                                      **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)

        if "order" in filters:
            orm_filters.update(ordered_service__order__barcode__id=filters['order'])
        return orm_filters

    class Meta:
        queryset = EquipmentTask.objects.all()
        resource_name = 'equipmenttaskro'
        authorization = DjangoAuthorization()
        limit = 50
        always_return_data = True
        filtering = {
            'ordered_service': ALL_WITH_RELATIONS,
            'equipment_assay': ALL_WITH_RELATIONS,
            'service': ALL_WITH_RELATIONS,
            'status': ALL
        }        

class EquipmentTaskResource(ExtBatchResource):
    
    equipment_assay = fields.ForeignKey(EquipmentAssayResource, 'equipment_assay')
    ordered_service = fields.ForeignKey(OrderedServiceResource, 'ordered_service')
    
    def dehydrate(self, bundle):
        bundle.data['assay_code'] = bundle.obj.equipment_assay.code
        bundle.data['assay_name'] = bundle.obj.equipment_assay.name
        bundle.data['status_name'] = bundle.obj.get_status_display()
        bundle.data['equipment_name'] = bundle.obj.equipment_assay.equipment
        bundle.data['service_name'] = bundle.obj.ordered_service.service
        bundle.data['patient_name'] = bundle.obj.ordered_service.order.patient.short_name()
        bundle.data['lat'] = bundle.obj.ordered_service.order.patient.translify()
        bundle.data['order'] = bundle.obj.ordered_service.order.barcode.id
        bundle.data['result'] = bundle.obj.result and bundle.obj.result.get_full_result() or u''
        return bundle
    
    
    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(EquipmentTaskResource, self).build_filters(filters)

        if "order" in filters:
            orm_filters.update(ordered_service__order__barcode__id=filters['order'])
        return orm_filters

    class Meta:
        queryset = EquipmentTask.objects.all()
        resource_name = 'equipmenttask'
        authorization = LocalAuthorization()
        always_return_data = True
        limit = 1000
        filtering = {
            'ordered_service': ALL_WITH_RELATIONS,
            'equipment_assay': ALL_WITH_RELATIONS,
            'service': ALL_WITH_RELATIONS,
            'status': ALL
        }        


class EquipmentResultResource(ExtBatchResource):

    def dehydrate(self, bundle):
        return bundle
        
    class Meta:
        queryset = EquipmentResult.objects.all()
        resource_name = 'equipmentresult'
        authorization = LocalAuthorization()
        filtering = {
            'order': ALL,
            'assay': ALL,
        }   
        
class EquipmentResultReadOnlyResource(ExtBatchResource):

    def dehydrate(self, bundle):
        return bundle
        
    class Meta:
        queryset = EquipmentResult.objects.all()
        resource_name = 'equipmentresultro'
        authorization = DjangoAuthorization()
        filtering = {
            'order': ALL,
            'assay': ALL,
        }   
        
class PromotionResource(ExtResource):
    discount = fields.ForeignKey(DiscountResource, 'discount', null=True)
    class Meta:
        queryset = Promotion.objects.all().select_related()
        resource_name = 'promotion'
        authorization = DjangoAuthorization()
        filtering = {
        }   
        
class CalendarResource(ExtResource):
    
    class Meta:
        queryset = Calendar.objects.all()
        resource_name = 'calendar'
        authorization = DjangoAuthorization()
        filtering = {
            'title': ALL,
        }
        
class RejectionCauseResource(ExtResource):
    
    class Meta:
        queryset = RejectionCause.objects.all()
        resource_name = 'rejection_cause'
        authorization = DjangoAuthorization()
        filtering = {
            'name': ALL,
        }

        
class PreorderResource(ExtBatchResource):
    patient = fields.ForeignKey(PatientResource, 'patient', null=True)
    timeslot = fields.OneToOneField('apps.api.registry.EventResource', 'timeslot', null=True)
    service = fields.ForeignKey(ExtendedServiceResource, 'service', null=True)
    promotion = fields.ForeignKey(PromotionResource, 'promotion', null=True)
    rejection_cause = fields.ForeignKey(RejectionCauseResource, 'rejection_cause', null=True)
    card = fields.ForeignKey(CardResource, 'card', null = True)
    referral = fields.ForeignKey(ReferralResource, 'referral', null = True)
    who_deleted = fields.ForeignKey(UserResource, 'who_deleted', null=True)
    
    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
        referral = request and request.active_profile.staff.referral
        if referral:
            kwargs['referral']=referral
        result = super(PreorderResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result
    
    def obj_update(self, bundle, request=None, **kwargs):
        if bundle.data['deleted']:
            bundle.data['who_deleted']=request.user
        result = super(PreorderResource, self).obj_update(bundle=bundle, request=request, **kwargs)
        return result
    
    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(PreorderResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'patient')
            if len(smart_filters.keys())==1:
                try:
                    orm_filters = ComplexQuery( Q(barcode__id=int(filters['search'])) | Q(**smart_filters), \
                                      **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)
        return orm_filters
    
    class Meta:
        queryset = Preorder.objects.filter(deleted = False)
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


class ExtPreorderResource(ExtResource):
    patient = fields.ForeignKey(PatientResource, 'patient', null=True)
    timeslot = fields.OneToOneField('apps.api.registry.EventResource', 'timeslot', null=True)
    visit = fields.OneToOneField(VisitResource, 'visit', null=True)
    service = fields.ForeignKey(ExtendedServiceResource, 'service', null=True)
    promotion = fields.ForeignKey(PromotionResource, 'promotion', null=True)
    card = fields.ForeignKey(CardResource, 'card', null=True)
    referral = fields.ForeignKey(ReferralResource, 'referral', null=True)
    who_deleted = fields.ForeignKey(UserResource, 'who_deleted', null=True)
    
    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
        referral = request and request.active_profile.staff.referral
        if referral:
            kwargs['referral']=referral
        result = super(ExtPreorderResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result
    
    def obj_update(self, bundle, request=None, **kwargs):
#        import pdb; pdb.set_trace()
        if bundle.data['deleted']:
            bundle.data['who_deleted']=request.user
        result = super(ExtPreorderResource, self).obj_update(bundle=bundle, request=request, **kwargs)
        return result
    
    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(ExtPreorderResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'patient')
            if len(smart_filters.keys())==1:
                try:
                    orm_filters = ComplexQuery( Q(barcode__id=int(filters['search'])) | Q(**smart_filters), \
                                      **orm_filters)
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
        allowed_methods = ['get', 'post', 'put']


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
            if len(smart_filters.keys())==1:
                try:
                    orm_filters = ComplexQuery( Q(barcode__id=int(filters['search'])) | Q(**smart_filters), \
                                      **orm_filters)
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
        allowed_methods = ['get', 'post', 'put']


class EventResource(ExtResource):
    staff = fields.ForeignKey(PositionResource, 'staff', null=True)
    #preord = fields.ToOneField('apps.api.registry.PreorderResource', 'preord', null=True)
    
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
        allowed_methods = ['get', 'post', 'put']



class IssueTypeResource(ExtResource):
    
    class Meta:
        queryset = IssueType.objects.all()
        resource_name = 'issuetype'
        limit = 100
        authorization = DjangoAuthorization()
        filtering = {
            'name': ALL
        }        


class IssueResource(ExtResource):
    
    type = fields.ForeignKey(IssueTypeResource, 'type')
    
    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
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
        

class ContentTypeResource(ExtResource):
    class Meta:
        queryset = ContentType.objects.all()
        resource_name = 'contenttype'
        authorization = DjangoAuthorization()
        allowed_methods = ['get']

class AccountResource(ExtResource):
    
    class Meta:
        queryset = Account.objects.all()
        resource_name = 'account'
        authorization = DjangoAuthorization()
        
class ClientAccountResource(ExtResource):
    client_item = fields.ForeignKey(ClientItemResource, 'client_item')
    account = fields.ForeignKey(AccountResource, 'account')
    
    def dehydrate(self, bundle):
        bundle.data['client_name'] = bundle.obj.client_item.client
        bundle.data['client_balance'] = bundle.obj.client_item.client.balance
        bundle.data['account_id'] = bundle.obj.account.id
        bundle.data['amount'] = bundle.obj.account.amount
        return bundle
    
    class Meta:
        queryset = ClientAccount.objects.all().select_related()
        resource_name = 'clientaccount'
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'id': ALL,
            'client_item': ALL_WITH_RELATIONS,
        }
        
class PaymentResource(ExtResource):
    client_account = fields.ForeignKey(ClientAccountResource, 'client_account')
    content_type = fields.ForeignKey(ContentTypeResource, 'content_type', null=True)
    
    def dehydrate(self, bundle):
        bundle.data['client_name'] = bundle.obj.client_account.client_item.client.full_name()
        bundle.data['client'] = bundle.obj.client_account.client_item.client.id
        bundle.data['account_id'] = bundle.obj.client_account.account.id
        bundle.data['amount'] = abs(bundle.obj.amount)
        return bundle
    
    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
        kwargs['office']=request.active_profile.department.state
        result = super(PaymentResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result
    
    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(PaymentResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'client_account__client_item__client')
            if len(smart_filters.keys())==1:
                try:
                    orm_filters = ComplexQuery(Q(**smart_filters), \
                                      **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)
        return orm_filters
    
    class Meta:
        queryset = Payment.objects.all()
        resource_name = 'payment'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 1000
        filtering = {
            'id': ALL,
            'doc_date': ALL,
            'client_account': ALL_WITH_RELATIONS,
            'direction': ALL
        }
        
        
class InvoiceResource(ExtResource):
    
    office = fields.ForeignKey(OwnStateResource, 'office')
    state = fields.ForeignKey(MedStateResource, 'state')
    
    def dehydrate(self, bundle):
        bundle.data['state_name'] = bundle.obj.state
        bundle.data['office_name'] = bundle.obj.office
        bundle.data['operator_name'] = bundle.obj.operator
        return bundle
    
    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
        kwargs['office']=request.active_profile.department.state
        result = super(InvoiceResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result
    
    class Meta:
        queryset = Invoice.objects.all()
        resource_name = 'invoice'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 100
        filtering = {
            'id': ALL,
            'state': ALL_WITH_RELATIONS,
            'office': ALL_WITH_RELATIONS
        }
        
        
class InvoiceItemResource(ExtResource):
    
    invoice = fields.ForeignKey(InvoiceResource, 'invoice')
    ordered_service = fields.ToOneField(SamplingServiceResource, 'ordered_service')
    
    def dehydrate(self, bundle):
        s = bundle.obj.ordered_service
        bundle.data['created'] = s.order.created
        bundle.data['barcode'] = s.order.barcode.id
        bundle.data['patient_name'] = s.order.patient.short_name()
        bundle.data['service_name'] = s.service
        bundle.data['sampling'] = s.sampling.tube
        
        return bundle
    
    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
        result = super(InvoiceItemResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result
    
    class Meta:
        queryset = InvoiceItem.objects.all()
        resource_name = 'invoiceitem'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 1000
        filtering = {
            'id': ALL,
            'invoice': ALL_WITH_RELATIONS
        }
        
######### remoting


class ServiceToSend(ExtResource):
    """
    """

    order = fields.ToOneField(VisitResource, 'order')
    service = fields.ToOneField(BaseServiceResource, 'service')
    staff = fields.ToOneField(PositionResource, 'staff', full=True, null=True)
    execution_place = fields.ForeignKey(StateResource, 'execution_place')
    sampling = fields.ForeignKey(SamplingResource, 'sampling', null=True)

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
        
        
class ReportTreeResource(ModelResource):
    
    parent = fields.ForeignKey('self', 'parent', null=True)
    
    def dehydrate(self, bundle):
        bundle.data['text'] = bundle.obj.name
        bundle.data['slug'] = bundle.obj.slug
        bundle.data['fields'] = bundle.obj.get_fields()
        bundle.data['parent'] =  bundle.obj.parent and bundle.obj.parent.id
        if bundle.obj.is_leaf_node():
            bundle.data['leaf'] = bundle.obj.is_leaf_node()
        return bundle
    

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(ReportTreeResource, self).build_filters(filters)

        if "parent" in filters:
            if filters['parent']=='root':
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
            'name':('istartswith',),
            'is_active': ALL,
            'parent': ALL_WITH_RELATIONS
        }

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


class NosologicalFormResource(ExtResource):
    
    class Meta:
        queryset = NosologicalForm.objects.all()
        resource_name = 'nosological_form'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
        }


class AgeCategoryResource(ExtResource):
    
    class Meta:
        queryset = AgeCategory.objects.all()
        resource_name = 'age_category'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
        }


class PhaseResource(ExtResource):
    class Meta:
        queryset = Phase.objects.all()
        resource_name = 'phase'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
        }
        
class StageResource(ExtResource):
    
    class Meta:
        queryset = Stage.objects.all()
        resource_name = 'stage'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
        }


class ComplicationsResource(ExtResource):
    
    class Meta:
        queryset = Complications.objects.all()
        resource_name = 'complications'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
        }


class TermResource(ExtResource):
    
    class Meta:
        queryset = Term.objects.all()
        resource_name = 'term'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
        }


class MedStandartResource(ExtResource):
    nosological_form = fields.ForeignKey(NosologicalFormResource, 'nosological_form', null=True)
    age_category = fields.ManyToManyField(AgeCategoryResource, 'age_category', null=True)
    phase = fields.ForeignKey(PhaseResource, 'phase', null=True)
    stage = fields.ForeignKey(StageResource, 'stage', null=True)
    complications = fields.ForeignKey(ComplicationsResource, 'complications', null=True)
    terms = fields.ManyToManyField(TermResource, 'terms', null=True)
    mkb10 = fields.ForeignKey(ICD10Resource, 'mkb10')
    
    def dehydrate(self, bundle):
        bundle.data['nosological_form_name'] = bundle.obj.nosological_form and bundle.obj.nosological_form.name or u'Не указано'
        bundle.data['age_category_name'] = bundle.obj.get_items_str('age_category') or u'Не указано'
        bundle.data['phase_name'] = bundle.obj.phase and bundle.obj.phase.name or u'Не указано'
        bundle.data['stage_name'] = bundle.obj.stage and bundle.obj.stage.name or u'Не указано'
        bundle.data['complications_name'] = bundle.obj.complications and bundle.obj.complications.name or u'Не указано'
        bundle.data['terms_name'] = bundle.obj.get_items_str('terms') or u'Не указано'
        return bundle
    
    class Meta:
        queryset = Standart.objects.all()
        resource_name = 'medstandart'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
            'mkb10': ALL,
        }
        
class StandartItemResource(ExtResource):
    standart = fields.ForeignKey(MedStandartResource, 'standart')
    service = fields.ForeignKey(ExtendedServiceResource, 'service')
    
    def dehydrate(self, bundle):
        bundle.data['service_name'] = bundle.obj.service.base_service.name
        bundle.data['price'] = bundle.obj.service.get_actual_price()
        bundle.data['state'] = bundle.obj.service.state
        return bundle
    
    class Meta:
        queryset = StandartItem.objects.all()
        resource_name = 'standartitem'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
            'standart': ALL
        }
              

class QuestionnaireResource(ExtResource):
    base_service = fields.ManyToManyField(BaseServiceResource, 'base_service')
    staff = fields.ManyToManyField(StaffResource, 'staff')

    class Meta:
        queryset = Questionnaire.objects.all()
        resource_name = 'questionnaire'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
            'staff': ALL_WITH_RELATIONS,
            'base_service': ALL_WITH_RELATIONS
        }

from accounting.models import Contract as AccContract, \
    Invoice as AccInvoice, InvoiceItem as AccInvoiceItem


class AccountingContractResource(ExtResource):

    branch = fields.ForeignKey(StateResource, 'branch')
    state = fields.ForeignKey(StateResource, 'state')

    def dehydrate(self, bundle):
        bundle.data['branch_name'] = bundle.obj.branch
        bundle.data['state_name'] = bundle.obj.state
        return bundle

    class Meta:
        queryset = AccContract.objects.all()
        resource_name = 'acc_contract'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
            'number': ALL,
            'on_date': ALL,
            'branch': ALL_WITH_RELATIONS,
            'state': ALL_WITH_RELATIONS,
        }


class AccountingInvoiceResource(ExtResource):

    contract = fields.ForeignKey(AccountResource, 'contract')

    class Meta:
        queryset = AccInvoice.objects.all()
        resource_name = 'acc_invoice'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
            'number': ALL,
            'on_date': ALL,
            'contract': ALL_WITH_RELATIONS,
        }


class AccountingInvoiceItemResource(ExtResource):

    invoice = fields.ForeignKey(AccountingInvoiceResource, 'invoice')
    patient = fields.ForeignKey(PatientResource, 'patient')
    service = fields.ForeignKey(BaseServiceResource, 'service')
    execution_place = fields.ForeignKey(StateResource, 'execution_place')

    def dehydrate(self, bundle):
        bundle.data['patient_name'] = bundle.obj.patient
        bundle.data['service_name'] = bundle.obj.service
        return bundle

    class Meta:
        queryset = AccInvoiceItem.objects.all()
        resource_name = 'acc_invoice_item'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 0
        filtering = {
            'id': ALL,
            'number': ALL,
            'on_date': ALL,
            'invoice': ALL_WITH_RELATIONS,
            'patient': ALL_WITH_RELATIONS,
            'service': ALL_WITH_RELATIONS,
            'execution_place': ALL_WITH_RELATIONS,
            'preorder': ALL_WITH_RELATIONS
        }


api = Api(api_name=get_api_name('dashboard'))

api.register(UserResource())

#patient
api.register(PatientResource())
api.register(InsurancePolicyResource())
api.register(ContractResource())
api.register(ContractTypeResource())

#visit
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
api.register(VisitPreorderResource())

#lab
api.register(InputListResource())
api.register(LabOrderResource())
api.register(AnalysisResource())
api.register(ResultResource())
api.register(LabResource())
api.register(SamplingResource())
api.register(BarcodedSamplingResource())
api.register(TubeResource())
api.register(EquipmentResource())
api.register(EquipmentAssayResource())
api.register(EquipmentResultResource())
api.register(EquipmentResultReadOnlyResource())
api.register(EquipmentTaskResource())
api.register(EquipmentTaskReadOnlyResource())

#service
api.register(LSResource())
api.register(BaseServiceResource())
api.register(BaseServiceGroupResource())
api.register(ExtendedServiceResource())
api.register(LabServiceGroupResource())
api.register(ICD10Resource())

#state
api.register(PositionResource())
api.register(StaffResource())
api.register(StaffSchedResource())
api.register(PosSchedResource())
api.register(StateResource())
api.register(DepartmentResource())
api.register(MedStateResource())
api.register(OwnStateResource())
api.register(InsuranceStateResource())
api.register(DoctorResource())

#remoting
api.register(RemoteStateResource())

#pricelist
api.register(DiscountResource())

#numeration
api.register(BarcodeResource())
api.register(BCPackageResource())
api.register(NumeratorItemResource())
api.register(RegExamCardResource())

#examination
api.register(TemplateGroupResource())
api.register(CardTemplateResource())
api.register(ExaminationCardResource())
api.register(ExamEquipmentResource())
api.register(DicomResource())
api.register(FieldSetResource())
api.register(SubSectionResource())
api.register(TemplateResource())
api.register(CardResource())
api.register(GlossaryResource())
api.register(QuestionnaireResource())

#helpdesk
api.register(IssueTypeResource())
api.register(IssueResource())

#scheduler
api.register(RejectionCauseResource())
api.register(CalendarResource())
api.register(PreorderResource())
api.register(ExtPreorderResource())
api.register(EventResource())

#interlayer
api.register(ClientItemResource())

#billing
api.register(AccountResource())
api.register(ContentTypeResource())
api.register(ClientAccountResource())
api.register(PaymentResource())

api.register(DebtorResource())
api.register(DepositorResource())


api.register(InvoiceResource())
api.register(InvoiceItemResource())


api.register(PromotionResource())

#crm
api.register(AdSourceResource())


#remoting
api.register(ServiceToSend())

#medstandart
api.register(NosologicalFormResource())
api.register(AgeCategoryResource())
api.register(PhaseResource())
api.register(StageResource())
api.register(ComplicationsResource())
api.register(TermResource())
api.register(MedStandartResource())
api.register(StandartItemResource())

#reporting
api.register(QueryResource())
api.register(ReportTreeResource())
api.register(ReportResource())

#accounting
api.register(AccountingContractResource())
api.register(AccountingInvoiceResource())
api.register(AccountingInvoiceItemResource())
