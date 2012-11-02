# -*- coding: utf-8 -*-
from tastypie.api import Api
from tastypie import fields
from contrib.ext.resources import ExtResource
from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL_WITH_RELATIONS, ALL
from billing.models import Account, Payment, ClientAccount
from interlayer.api import ClientItemResource


class AccountResource(ExtResource):

    class Meta:
        queryset = Account.objects.all()
        resource_name = 'account'
        authorization = DjangoAuthorization()
        list_allowed_methods = ['get', 'post', 'put']


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
        list_allowed_methods = ['get', 'post', 'put']


class PaymentResource(ExtResource):
    client_account = fields.ForeignKey(ClientAccountResource, 'client_account')
    content_type = fields.ForeignKey('core.api.ContentTypeResource', 'content_type', null=True)

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
        list_allowed_methods = ['get', 'post', 'put']

api = Api(api_name = 'billing')
api.register(AccountResource())
api.register(ContentTypeResource())
api.register(ClientAccountResource())
api.register(PaymentResource())
