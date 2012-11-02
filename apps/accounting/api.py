# -*- coding: utf-8 -*-

from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie import fields
from tastypie.api import Api
from api.resources import ExtResource
from accounting.models import Contract as AccContract, \
    Invoice as AccInvoice, InvoiceItem as AccInvoiceItem


class AccountingContractResource(ExtResource):

    branch = fields.ForeignKey('state.api.StateResource', 'branch')
    state = fields.ForeignKey('state.api.StateResource', 'state')

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        result = super(AccountingContractResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

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
        list_allowed_methods = ['get', 'post', 'put']


class AccountingInvoiceResource(ExtResource):

    contract = fields.ForeignKey(AccountingContractResource, 'contract')

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        result = super(AccountingInvoiceResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

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
        list_allowed_methods = ['get', 'post', 'put']


class AccountingInvoiceItemResource(ExtResource):

    invoice = fields.ForeignKey(AccountingInvoiceResource, 'invoice')
    patient = fields.ForeignKey('patient.api.PatientResource', 'patient')
    service = fields.ForeignKey('service.api.BaseServiceResource', 'service')
    execution_place = fields.ForeignKey('state.api.StateResource', 'execution_place')

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        result = super(AccountingInvoiceItemResource, self)\
                    .obj_create(bundle=bundle, request=request, **kwargs)
        return result

    def dehydrate(self, bundle):
        bundle.data['patient_name'] = bundle.obj.patient.full_name()
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
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='accounting')

api.register(AccountingContractResource())
api.register(AccountingInvoiceResource())
api.register(AccountingInvoiceItemResource())
