# -*- coding: utf-8 -*-

from tastypie.resources import ModelResource
from tastypie.utils.dict import dict_strip_unicode_keys
from django.http import HttpResponse
from tastypie.utils.mime import build_content_type
from tastypie.exceptions import BadRequest, NotFound, ImmediateHttpResponse
from django.db.models.query_utils import Q
from tastypie import http
from django.core.exceptions import MultipleObjectsReturned

class ComplexQuery(object):

    def __init__(self, *args, **kwargs):
        self.complex = args
        self.applicable = kwargs
    
    def get_complexes(self):
        return self.complex
    
    def get_applicable(self):
        return self.applicable
    

class ExtResource(ModelResource):
    """
    """
    
    def empty_to_none(self, d):
        clean_data = {}
        for k,v in d.iteritems():
            if v=='':
                clean_data[k] = None
            else:
                clean_data[k] = v
        return clean_data
    

    def alter_deserialized_detail_data(self, request, data):
        """
        A hook to alter detail data just after it has been received from the user &
        gets deserialized.

        Useful for altering the user data before any hydration is applied.
        """
        deserialized = data['objects']
        return self.empty_to_none(deserialized)
    

    def alter_detail_data_to_serialize(self, request, data):
        """
        A hook to alter detail data just before it gets serialized & sent to the user.

        Useful for restructuring/renaming aspects of the what's going to be
        sent.

        Should accommodate for receiving a single bundle of data.
        """
        data = {'success':True,
                'message':u'Операция выполнена успешно',
                'objects':data}
         
        return data

    
    def apply_filters(self, request, applicable_filters):
        """
        An ORM-specific implementation of ``apply_filters``.

        The default simply applies the ``applicable_filters`` as ``**kwargs``,
        but should make it possible to do more advanced things.
        """
        if isinstance(applicable_filters, ComplexQuery):
            return self.get_object_list(request).filter(*applicable_filters.get_complexes(),**applicable_filters.get_applicable())
        elif isinstance(applicable_filters, dict):
            return self.get_object_list(request).filter(**applicable_filters)

    def create_response(self, request, data, response_class=HttpResponse, **response_kwargs):
        response = super(ExtResource, self).create_response(request, data, response_class=response_class, **response_kwargs)
        response['Access-Control-Allow-Origin'] = "*"
        response['Access-Control-Allow-Methods'] = "*"
        response['Access-Control-Allow-Headers'] = "content-type,x-requested-with"
        return response

    def method_check(self, request, allowed=None):
        """
        Ensures that the HTTP method used on the request is allowed to be
        handled by the resource.

        Takes an ``allowed`` parameter, which should be a list of lowercase
        HTTP methods to check against. Usually, this looks like::

            # The most generic lookup.
            self.method_check(request, self._meta.allowed_methods)

            # A lookup against what's allowed for list-type methods.
            self.method_check(request, self._meta.list_allowed_methods)

            # A useful check when creating a new endpoint that only handles
            # GET.
            self.method_check(request, ['get'])
        """
        if allowed is None:
            allowed = []

        request_method = request.method.lower()

        if request_method == "options":
            allows = ','.join(map(str.upper, allowed))
            response = HttpResponse(allows)
            response['Allow'] = allows
            response['Access-Control-Allow-Origin'] = "*"
            response['Access-Control-Allow-Methods'] = request.META.get('HTTP_ACCESS_CONTROL_REQUEST_METHOD')
            response['Access-Control-Allow-Headers'] = request.META.get('HTTP_ACCESS_CONTROL_REQUEST_HEADERS')
            raise ImmediateHttpResponse(response=response)

        if not request_method in allowed:
            raise ImmediateHttpResponse(response=http.HttpMethodNotAllowed())

        return request_method        

class ExtBatchResource(ExtResource):
    """
    """
    def alter_deserialized_detail_data(self, request, data):
        """
        """
        
        deserialized = data['objects']
        if isinstance(deserialized, dict):
            return self.empty_to_none(deserialized)
        else:
            return map(self.empty_to_none, deserialized)
    
    
    def post_list(self, request, **kwargs):
        """
        Creates a new resource/object with the provided data.

        Calls ``obj_create`` with the provided data and returns a response
        with the new resource's location.

        If a new resource is created, return ``HttpCreated`` (201 Created).
        If ``Meta.always_return_data = True``, there will be a populated body
        of serialized data.
        """
        deserialized = self.deserialize(request, request.raw_post_data, format=request.META.get('CONTENT_TYPE', 'application/json'))
        deserialized = self.alter_deserialized_detail_data(request, deserialized)
        if isinstance(deserialized, dict):
            deserialized = [deserialized]
        bundles = []
        for d in deserialized:
            bundle = self.build_bundle(data=dict_strip_unicode_keys(d), request=request)
            self.is_valid(bundle, request)
            updated_bundle = self.obj_create(bundle, request=request, **self.remove_api_resource_names(kwargs))
            location = self.get_resource_uri(updated_bundle)
            bundles.append(updated_bundle)
            
        if not self._meta.always_return_data:
            return http.HttpCreated(location=location)
        else:
            data = []
            for updated_bundle in bundles:
                updated_bundle = self.full_dehydrate(updated_bundle)
                data.append(updated_bundle)
            data = self.alter_detail_data_to_serialize(request, data)
            return self.create_response(request, data, response_class=http.HttpCreated, location=location)


    def put_list(self, request, **kwargs):
        """
        Either updates an existing resource or creates a new one with the
        provided data.

        Calls ``obj_update`` with the provided data first, but falls back to
        ``obj_create`` if the object does not already exist.

        If a new resource is created, return ``HttpCreated`` (201 Created).
        If ``Meta.always_return_data = True``, there will be a populated body
        of serialized data.

        If an existing resource is modified and
        ``Meta.always_return_data = False`` (default), return ``HttpNoContent``
        (204 No Content).
        If an existing resource is modified and
        ``Meta.always_return_data = True``, return ``HttpAccepted`` (202
        Accepted).
        """
        deserialized = self.deserialize(request, request.raw_post_data, format=request.META.get('CONTENT_TYPE', 'application/json'))
        deserialized = self.alter_deserialized_detail_data(request, deserialized)

        if isinstance(deserialized, dict):
            deserialized = [deserialized]
            
        bundles = []
        for d in deserialized:
            
            bundle = self.build_bundle(data=dict_strip_unicode_keys(d), request=request)
            self.is_valid(bundle, request)
            
            if 'id' in d:
                kwargs['pk'] = d['id']
    
            try:
                updated_bundle = self.obj_update(bundle, request=request, **self.remove_api_resource_names(kwargs))
            except (NotFound, MultipleObjectsReturned):
                updated_bundle = self.obj_create(bundle, request=request, **self.remove_api_resource_names(kwargs))
    
            if self._meta.always_return_data:
                updated_bundle = self.full_dehydrate(updated_bundle)
            
            bundles.append(updated_bundle)

        if not self._meta.always_return_data:
            return http.HttpNoContent()
        else:
            bundles = self.alter_detail_data_to_serialize(request, bundles)
            return self.create_response(request, bundles, response_class=http.HttpAccepted)

