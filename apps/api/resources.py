# -*- coding: utf-8 -*-

from tastypie.resources import ModelResource
from tastypie.utils.dict import dict_strip_unicode_keys
from django.http import HttpResponse
from tastypie.utils.mime import build_content_type
from tastypie.exceptions import BadRequest, NotFound
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

    
#    def build_response(self, request, updated_bundle, message=None, status=200):
#        """
#        """ 
#
#        desired_format = self.determine_format(request)
#        bundle = self.full_dehydrate(updated_bundle.obj)
#        bundle.data = {'success':True,
#                       'message':message or u'Операция выполнена успешно',
#                       'objects':bundle.data} 
#        serialized = self.serialize(request, bundle, desired_format)
#        response = HttpResponse(content=serialized, 
#                            content_type="text/html",#build_content_type(desired_format),
#                            status=status)
#        return response
    
#    def create_response(self, request, data):
#        """
#        Extracts the common "which-format/serialize/return-response" cycle.
#        
#        Mostly a useful shortcut/hook.
#        """
#        desired_format = self.determine_format(request)
#        serialized = self.serialize(request, data, desired_format)
#        response = HttpResponse(content=serialized, 
#                            content_type=build_content_type(desired_format))
#        return response
    
#    def post_list(self, request, **kwargs):
#        deserialized = self.deserialize(request, request.raw_post_data, format=request.META.get('CONTENT_TYPE', 'application/json'))
#        bundle = self.build_bundle(data=dict_strip_unicode_keys(deserialized))
#        self.is_valid(bundle, request)
#        updated_bundle = self.obj_create(bundle, request=request)
#        
#        return self.build_response(request, updated_bundle)

#    def create_response(self, request, data, response_class=HttpResponse, **response_kwargs):
#        """
#        Extracts the common "which-format/serialize/return-response" cycle.
#
#        Mostly a useful shortcut/hook.
#        """
#        desired_format = self.determine_format(request)
#        serialized = self.serialize(request, data, desired_format)
#        return response_class(content=serialized, content_type=build_content_type(desired_format), **response_kwargs)


#    def put_detail(self, request, **kwargs):
#        """
#        Either updates an existing resource or creates a new one with the
#        provided data.
#        
#        Calls ``obj_update`` with the provided data first, but falls back to
#        ``obj_create`` if the object does not already exist.
#        
#        If a new resource is created, return ``HttpCreated`` (201 Created).
#        If an existing resource is modified, return ``HttpAccepted`` (204 No Content).
#        """
#        deserialized = self.deserialize(request, request.raw_post_data, format=request.META.get('CONTENT_TYPE', 'application/json'))
#        bundle = self.build_bundle(data=dict_strip_unicode_keys(deserialized))
#        self.is_valid(bundle, request)
#
#        
#        try:
#            updated_bundle = self.obj_update(bundle, request=request, pk=kwargs.get('pk'))
#            return self.build_response(request, updated_bundle) #return HttpAccepted()
#        except Exception, err:
#            updated_bundle = self.obj_create(bundle, request=request, pk=kwargs.get('pk'))
#            return self.build_response(request, updated_bundle) #return HttpCreated(location=self.get_resource_uri(updated_bundle))
        
#    def full_hydrate(self, bundle):
#        """
#        Given a populated bundle, distill it and turn it back into
#        a full-fledged object instance.
#        """
#        if bundle.obj is None:
#            bundle.obj = self._meta.object_class()
#        
#        for field_name, field_object in self.fields.items():
#            if field_object.attribute:
#                value = field_object.hydrate(bundle)
#                
#                if value is not None or field_object.null:
#                    # We need to avoid populating M2M data here as that will
#                    # cause things to blow up.
#                    if not getattr(field_object, 'is_related', False):
#                        setattr(bundle.obj, field_object.attribute, value)
#                    elif not getattr(field_object, 'is_m2m', False):
#                        if value is not None:
#                            setattr(bundle.obj, field_object.attribute, value.obj)
#                        elif field_object.fk_resource is None:
#                            continue
#                        else:
#                            setattr(bundle.obj, field_object.attribute, None)
#            # Check for an optional method to do further hydration.
#            method = getattr(self, "hydrate_%s" % field_name, None)
#            
#            if method:
#                bundle = method(bundle)
#        
#        bundle = self.hydrate(bundle)
#        return bundle

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


#    def obj_get_list(self, request=None, **kwargs):
#        """
#        A ORM-specific implementation of ``obj_get_list``.
#        
#        Takes an optional ``request`` object, whose ``GET`` dictionary can be
#        used to narrow the query.
#        """
#        filters = {}
#        
#        if hasattr(request, 'GET'):
#            # Grab a mutable copy.
#            filters = request.GET.copy()
#            
#        # Update with the provided kwargs.
#        filters.update(kwargs)
#        applicable_filters = self.build_filters(filters=filters)
#        
#        try:
#            base_object_list = self.apply_filters(request, applicable_filters)
#            return self.apply_authorization_limits(request, base_object_list)
#        except ValueError, e:
#            raise BadRequest("Invalid resource lookup data provided (mismatched type).")


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
    
    
#    def build_list_response(self, request, updated_bundles, message=None, status=200):
#        """
#        """ 
#
#        desired_format = self.determine_format(request)
#        serialized_bundles = []
#        for updated_bundle in updated_bundles:
#            bundle = self.full_dehydrate(updated_bundle.obj)
#            serialized = self.serialize(request, bundle, desired_format)
#            serialized_bundles.append(serialized)
#        content = """{"success":true,"message":"%s","objects":[%s]}"""  % (message or u'Операция выполнена успешно', ",".join(serialized_bundles)) 
#        return HttpResponse(content=content, 
#                            content_type=build_content_type(desired_format),
#                            status=status)
       
#    def build_response(self, request, updated_bundle, message=None, status=200):
#        """
#        """ 
#
#        desired_format = self.determine_format(request)
#        bundle = self.full_dehydrate(updated_bundle.obj)
#        bundle.data = {'success':True,
#                       'message':message or u'Операция выполнена успешно',
#                       'objects':bundle.data} 
#        serialized = self.serialize(request, bundle, desired_format)
#        return HttpResponse(content=serialized, 
#                            content_type=build_content_type(desired_format),
#                            status=status)

#    def alter_detail_data_to_serialize(self, request, data):
#        """
#        A hook to alter detail data just before it gets serialized & sent to the user.
#
#        Useful for restructuring/renaming aspects of the what's going to be
#        sent.
#
#        Should accommodate for receiving a single bundle of data.
#        """
#        data = {'success':True,
#                'message':u'Операция выполнена успешно',
#                'objects':data}
#         
#        return data


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
            return self.create_response(request, updated_bundle, response_class=http.HttpAccepted)


#    def post_list(self, request, **kwargs):
#        deserialized = self.deserialize(request, request.raw_post_data, format=request.META.get('CONTENT_TYPE', 'application/json'))
##        bundle = self.build_bundle(data=dict_strip_unicode_keys(deserialized))
##        self.is_valid(bundle, request)
##        updated_bundle = self.obj_create(bundle, request=request)
##        
##        return self.build_response(request, updated_bundle)
#    
#        bundles_seen = []
#        for object_data in deserialized:
#            bundle = self.build_bundle(data=dict_strip_unicode_keys(object_data))
#            self.is_valid(bundle, request)
#        
#            updated_bundle = self.obj_create(bundle, request=request, pk=kwargs.get('pk'))
#            bundles_seen.append(updated_bundle)
#        
#        return self.build_list_response(request, bundles_seen)    
    
        
#    def put_detail(self, request, **kwargs):
#        """
#        Either updates an existing resource or creates a new one with the
#        provided data.
#        
#        Calls ``obj_update`` with the provided data first, but falls back to
#        ``obj_create`` if the object does not already exist.
#        
#        If a new resource is created, return ``HttpCreated`` (201 Created).
#        If an existing resource is modified, return ``HttpAccepted`` (204 No Content).
#        """
#        deserialized = self.deserialize(request, request.raw_post_data, format=request.META.get('CONTENT_TYPE', 'application/json'))
#        
#        """
#        Предполагаем что передается массив bundles
#        """
#        if isinstance(deserialized, list) and len(deserialized):
#            deserialized = deserialized[0]
#
#        bundle = self.build_bundle(data=dict_strip_unicode_keys(deserialized))
#        self.is_valid(bundle, request)
#        
#        try:
#            updated_bundle = self.obj_update(bundle, request=request, pk=kwargs.get('pk'))
#            return self.build_response(request, updated_bundle) #return HttpAccepted()
#        except:
#            updated_bundle = self.obj_create(bundle, request=request, pk=kwargs.get('pk'))
#            return self.build_response(request, updated_bundle) #return HttpCreated(location=self.get_resource_uri(updated_bundle))
        
#    def put_list(self, request, **kwargs):
#        """
#        Either updates an existing resource or creates a new one with the
#        provided data.
#        
#        Calls ``obj_update`` with the provided data first, but falls back to
#        ``obj_create`` if the object does not already exist.
#        
#        If a new resource is created, return ``HttpCreated`` (201 Created).
#        If an existing resource is modified, return ``HttpAccepted`` (204 No Content).
#        """
#        deserialized = self.deserialize(request, request.raw_post_data, format=request.META.get('CONTENT_TYPE', 'application/json'))
#        
#        """
#        Предполагаем что передается массив bundles
#        """
#        bundles_seen = []
#        for object_data in deserialized:
#            bundle = self.build_bundle(data=dict_strip_unicode_keys(object_data))
#            self.is_valid(bundle, request)
#        
#            try:
#                updated_bundle = self.obj_update(bundle, request=request, pk=kwargs.get('pk'))
#                bundles_seen.append(updated_bundle)
#                #return self.build_response(request, updated_bundle) #return HttpAccepted()
#            except Exception, err:
#                updated_bundle = self.obj_create(bundle, request=request, pk=kwargs.get('pk'))
#                bundles_seen.append(updated_bundle)
#                #return self.build_response(request, updated_bundle) #return HttpCreated(location=self.get_resource_uri(updated_bundle))
#        
#        return self.build_list_response(request, bundles_seen)