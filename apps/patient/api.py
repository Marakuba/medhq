# -*- coding: utf-8 -*-

from patient.utils import smartFilter
from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie import fields
from tastypie.api import Api
from apiutils.resources import ExtResource, ComplexQuery
from patient.models import Patient, InsurancePolicy, ContractType, Contract
from django.db.models.query_utils import Q
from tastypie.cache import SimpleCache
from django.shortcuts import get_object_or_404


class PatientResource(ExtResource):

    ad_source = fields.ForeignKey('crm.api.AdSourceResource', 'ad_source', null=True)
    discount = fields.ForeignKey('pricelist.api.DiscountResource', 'discount', null=True)
    state = fields.ForeignKey('state.api.StateResource', 'state', null=True)
    client_item = fields.OneToOneField('interlayer.api.ClientItemResource', 'client_item', null=True)

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
                    cond = Q(**smart_filters)
                    try:
                        cond |= Q(visit__barcode__id=int(filters['search']))
                    except:
                        pass
                    cond |= Q(email__icontains=filters['search'])

                    orm_filters = ComplexQuery(cond, \
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
        list_allowed_methods = ['get', 'post', 'put']


class InsurancePolicyResource(ExtResource):

    insurance_state = fields.ForeignKey('state.api.InsuranceStateResource', 'insurance_state')
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
        list_allowed_methods = ['get', 'post', 'put']


class ContractTypeResource(ExtResource):
    class Meta:
        queryset = ContractType.objects.all()  # @UndefinedVariable
        resource_name = 'contracttype'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'type': ('istartswith',),
            'title': ALL,
            'validity': ALL,
            'id': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class ContractResource(ExtResource):
    patient = fields.ForeignKey(PatientResource, 'patient')
    state = fields.ForeignKey('state.api.OwnStateResource', 'state', null=True)
    contract_type = fields.ForeignKey(ContractTypeResource, 'contract_type', null=True)

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
        list_allowed_methods = ['get', 'post', 'put']


class DebtorResource(ExtResource):

    discount = fields.ForeignKey('pricelist.api.DiscountResource', 'discount', null=True)
    client_item = fields.OneToOneField('interlayer.api.ClientItemResource', 'client_item', null=True)

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(DebtorResource, self).build_filters(filters)

        if "visit_id" in filters:
            visit = get_object_or_404('visit.api.Visit', barcode__id=filters['visit_id'])

            orm_filters = {"pk__exact": visit.patient.id}

        if "search" in filters:

            orm_filters.update(smartFilter(filters['search']))

        return orm_filters

    class Meta:
        queryset = Patient.objects.filter(balance__lt=0)  # @UndefinedVariable
        resource_name = 'debtor'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        filtering = {
            'last_name': ('istartswith',),
            'id': ALL,
            'discount': ALL_WITH_RELATIONS,
            'hid_card': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class DepositorResource(ExtResource):

    discount = fields.ForeignKey('pricelist.api.DiscountResource', 'discount', null=True)
    client_item = fields.OneToOneField('interlayer.api.ClientItemResource', 'client_item', null=True)

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(DepositorResource, self).build_filters(filters)

        if "visit_id" in filters:
            visit = get_object_or_404('visit.api.Visit', barcode__id=filters['visit_id'])

            orm_filters = {"pk__exact": visit.patient.id}

        if "search" in filters:

            orm_filters.update(smartFilter(filters['search']))

        return orm_filters

    class Meta:
        queryset = Patient.objects.filter(balance__gt=0)  # @UndefinedVariable
        resource_name = 'depositor'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        filtering = {
            'last_name': ('istartswith',),
            'id': ALL,
            'discount': ALL_WITH_RELATIONS,
            'hid_card': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='patient')

api.register(PatientResource())
api.register(InsurancePolicyResource())
api.register(ContractResource())
api.register(ContractTypeResource())
api.register(DebtorResource())
api.register(DepositorResource())
