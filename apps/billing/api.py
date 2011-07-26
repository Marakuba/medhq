# -*- coding: utf-8 -*-
from tastypie.api import Api
from tastypie import fields
from contrib.ext.resources import ExtResource
from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL_WITH_RELATIONS
from billing.models import Account, Payment, ClientAccount
from django.contrib.contenttypes.models import ContentType
from interlayer.api import ClientItemResource 
from userprofile.api import UserResource
from tastypie.constants import ALL

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
        bundle.data['client_name'] = bundle.obj.client_item.client.name
        bundle.data['account_id'] = bundle.obj.account.id
        bundle.data['amount'] = bundle.obj.account.amount
        return bundle
    
    class Meta:
        queryset = ClientAccount.objects.all().select_related()
        resource_name = 'clientaccount'
        authorization = DjangoAuthorization()
        filtering = {
            'client_item' : ALL_WITH_RELATIONS,
        }
        
class PaymentResource(ExtResource):
    operator = fields.ForeignKey(UserResource, 'operator', null=True)
    client_account = fields.ForeignKey(ClientAccountResource, 'client_account')
    content_type = fields.ForeignKey(ContentTypeResource, 'content_type', null=True)
    
    def dehydrate(self, bundle):
        bundle.data['client_name'] = bundle.obj.client_account.client_item.client.name
        bundle.data['client'] = bundle.obj.client_account.client_item.client
        bundle.data['account_id'] = bundle.obj.client_account.account.id
        bundle.data['amount'] = abs(bundle.obj.amount)
        return bundle
    
    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator']=request.user
        result = super(PaymentResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result
    
    class Meta:
        queryset = Payment.objects.all()
        resource_name = 'payment'
        authorization = DjangoAuthorization()
        limit = 1000
        filtering = {
            'id' : ALL,
            'doc_date' : ALL,
        }
    
api = Api(api_name = 'billing')
api.register(AccountResource())
api.register(ContentTypeResource())
api.register(ClientAccountResource())
api.register(PaymentResource())