# -*- coding: utf-8 -*-

from tastypie.authorization import DjangoAuthorization
from tastypie.api import Api
from api.resources import ExtResource
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User
from tastypie.resources import ModelResource


class ContentTypeResource(ExtResource):
    class Meta:
        queryset = ContentType.objects.all()
        resource_name = 'contenttype'
        authorization = DjangoAuthorization()
        allowed_methods = ['get']


class UserResource(ModelResource):

    class Meta:
        queryset = User.objects.select_related().all()
        limit = 1000
        resource_name = 'user'
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='core')

api.register(ContentTypeResource())
api.register(UserResource())
