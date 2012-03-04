# -*- coding: utf-8 -*-

from tastypie.resources import ModelResource
from tastypie.utils.dict import dict_strip_unicode_keys
from django.http import HttpResponse
from tastypie.utils.mime import build_content_type
from tastypie.exceptions import BadRequest
from django.db.models.query_utils import Q

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

    def deserialize(self, request, data, format='application/json'):
        """
        """
        deserialized = super(ExtResource, self).deserialize(request=request, data=data, format=format)
        deserialized = deserialized['objects']
        clean_data = {}
        for k,v in deserialized.iteritems():
            if v=='':
                clean_data[k] = None
            else:
                clean_data[k] = v
        return clean_data
    
    
    def build_response(self, request, updated_bundle, message=None, status=200):
        """
        """ 

        desired_format = self.determine_format(request)
        bundle = self.full_dehydrate(updated_bundle.obj)
        bundle.data = {'success':True,
                       'message':message or u'Операция выполнена успешно',
                       'objects':bundle.data} 
        serialized = self.serialize(request, bundle, desired_format)
        response = HttpResponse(content=serialized, 
                            content_type="text/html",#build_content_type(desired_format),
                            status=status)
        return response
    
    def create_response(self, request, data):
        """
        Extracts the common "which-format/serialize/return-response" cycle.
        
        Mostly a useful shortcut/hook.
        """
        desired_format = self.determine_format(request)
        serialized = self.serialize(request, data, desired_format)
        response = HttpResponse(content=serialized, 
                            content_type=build_content_type(desired_format))
        return response
    
    def post_list(self, request, **kwargs):
        deserialized = self.deserialize(request, request.raw_post_data, format=request.META.get('CONTENT_TYPE', 'application/json'))
        bundle = self.build_bundle(data=dict_strip_unicode_keys(deserialized))
        self.is_valid(bundle, request)
        updated_bundle = self.obj_create(bundle, request=request)
        
        return self.build_response(request, updated_bundle)
        
    def put_detail(self, request, **kwargs):
        """
        Either updates an existing resource or creates a new one with the
        provided data.
        
        Calls ``obj_update`` with the provided data first, but falls back to
        ``obj_create`` if the object does not already exist.
        
        If a new resource is created, return ``HttpCreated`` (201 Created).
        If an existing resource is modified, return ``HttpAccepted`` (204 No Content).
        """
        deserialized = self.deserialize(request, request.raw_post_data, format=request.META.get('CONTENT_TYPE', 'application/json'))
        bundle = self.build_bundle(data=dict_strip_unicode_keys(deserialized))
        self.is_valid(bundle, request)

        
        try:
            updated_bundle = self.obj_update(bundle, request=request, pk=kwargs.get('pk'))
            return self.build_response(request, updated_bundle) #return HttpAccepted()
        except Exception, err:
            updated_bundle = self.obj_create(bundle, request=request, pk=kwargs.get('pk'))
            return self.build_response(request, updated_bundle) #return HttpCreated(location=self.get_resource_uri(updated_bundle))
        
    def full_hydrate(self, bundle):
        """
        Given a populated bundle, distill it and turn it back into
        a full-fledged object instance.
        """
        if bundle.obj is None:
            bundle.obj = self._meta.object_class()
        
        for field_name, field_object in self.fields.items():
            if field_object.attribute:
                value = field_object.hydrate(bundle)
                
                if value is not None or field_object.null:
                    # We need to avoid populating M2M data here as that will
                    # cause things to blow up.
                    if not getattr(field_object, 'is_related', False):
                        setattr(bundle.obj, field_object.attribute, value)
                    elif not getattr(field_object, 'is_m2m', False):
                        if value is not None:
                            setattr(bundle.obj, field_object.attribute, value.obj)
                        elif field_object.fk_resource is None:
                            continue
                        else:
                            setattr(bundle.obj, field_object.attribute, None)
            # Check for an optional method to do further hydration.
            method = getattr(self, "hydrate_%s" % field_name, None)
            
            if method:
                bundle = method(bundle)
        
        bundle = self.hydrate(bundle)
        return bundle
    
    def obj_get_list(self, request=None, **kwargs):
        """
        A ORM-specific implementation of ``obj_get_list``.
        
        Takes an optional ``request`` object, whose ``GET`` dictionary can be
        used to narrow the query.
        """
        filters = {}
        
        if hasattr(request, 'GET'):
            # Grab a mutable copy.
            filters = request.GET.copy()
            
        # Update with the provided kwargs.
        filters.update(kwargs)
        applicable_filters = self.build_filters(filters=filters)
        
        try:
            if isinstance(applicable_filters, ComplexQuery):
                base_object_list = self.get_object_list(request).filter(*applicable_filters.get_complexes(),**applicable_filters.get_applicable())
            elif isinstance(applicable_filters, dict):
                base_object_list = self.get_object_list(request).filter(**applicable_filters)
            return self.apply_authorization_limits(request, base_object_list)
        except ValueError, e:
            raise BadRequest("Invalid resource lookup data provided (mismatched type).")


class ExtBatchResource(ExtResource):
    """
    """
    def deserialize(self, request, data, format='application/json'):
        """
        """
        
        def empty_to_none(d):
            clean_data = {}
            for k,v in d.iteritems():
                if v=='':
                    clean_data[k] = None
                else:
                    clean_data[k] = v
            return clean_data
        
        deserialized = super(ExtResource, self).deserialize(request=request, data=data, format=format)
        deserialized = deserialized['objects']
        if isinstance(deserialized, dict):
            deserialized = [deserialized]
        return map(empty_to_none, deserialized)
    
    
    def build_list_response(self, request, updated_bundles, message=None, status=200):
        """
        """ 

        desired_format = self.determine_format(request)
        serialized_bundles = []
        for updated_bundle in updated_bundles:
            bundle = self.full_dehydrate(updated_bundle.obj)
            serialized = self.serialize(request, bundle, desired_format)
            serialized_bundles.append(serialized)
        content = """{"success":true,"message":"%s","objects":[%s]}"""  % (message or u'Операция выполнена успешно', ",".join(serialized_bundles)) 
        return HttpResponse(content=content, 
                            content_type=build_content_type(desired_format),
                            status=status)
       
    def build_response(self, request, updated_bundle, message=None, status=200):
        """
        """ 

        desired_format = self.determine_format(request)
        bundle = self.full_dehydrate(updated_bundle.obj)
        bundle.data = {'success':True,
                       'message':message or u'Операция выполнена успешно',
                       'objects':bundle.data} 
        serialized = self.serialize(request, bundle, desired_format)
        return HttpResponse(content=serialized, 
                            content_type=build_content_type(desired_format),
                            status=status)
       
    def post_list(self, request, **kwargs):
        deserialized = self.deserialize(request, request.raw_post_data, format=request.META.get('CONTENT_TYPE', 'application/json'))
        print "POST LIST"
        print deserialized
#        bundle = self.build_bundle(data=dict_strip_unicode_keys(deserialized))
#        self.is_valid(bundle, request)
#        updated_bundle = self.obj_create(bundle, request=request)
#        
#        return self.build_response(request, updated_bundle)
    
        bundles_seen = []
        for object_data in deserialized:
            bundle = self.build_bundle(data=dict_strip_unicode_keys(object_data))
            self.is_valid(bundle, request)
        
            updated_bundle = self.obj_create(bundle, request=request, pk=kwargs.get('pk'))
            bundles_seen.append(updated_bundle)
        
        return self.build_list_response(request, bundles_seen)    
    
        
    def put_detail(self, request, **kwargs):
        """
        Either updates an existing resource or creates a new one with the
        provided data.
        
        Calls ``obj_update`` with the provided data first, but falls back to
        ``obj_create`` if the object does not already exist.
        
        If a new resource is created, return ``HttpCreated`` (201 Created).
        If an existing resource is modified, return ``HttpAccepted`` (204 No Content).
        """
        deserialized = self.deserialize(request, request.raw_post_data, format=request.META.get('CONTENT_TYPE', 'application/json'))
        
        """
        Предполагаем что передается массив bundles
        """
        if isinstance(deserialized, list) and len(deserialized):
            deserialized = deserialized[0]

        bundle = self.build_bundle(data=dict_strip_unicode_keys(deserialized))
        self.is_valid(bundle, request)
        
        try:
            updated_bundle = self.obj_update(bundle, request=request, pk=kwargs.get('pk'))
            return self.build_response(request, updated_bundle) #return HttpAccepted()
        except:
            updated_bundle = self.obj_create(bundle, request=request, pk=kwargs.get('pk'))
            return self.build_response(request, updated_bundle) #return HttpCreated(location=self.get_resource_uri(updated_bundle))
        
    def put_list(self, request, **kwargs):
        """
        Either updates an existing resource or creates a new one with the
        provided data.
        
        Calls ``obj_update`` with the provided data first, but falls back to
        ``obj_create`` if the object does not already exist.
        
        If a new resource is created, return ``HttpCreated`` (201 Created).
        If an existing resource is modified, return ``HttpAccepted`` (204 No Content).
        """
        deserialized = self.deserialize(request, request.raw_post_data, format=request.META.get('CONTENT_TYPE', 'application/json'))
        
        """
        Предполагаем что передается массив bundles
        """
        bundles_seen = []
        for object_data in deserialized:
            print object_data
            bundle = self.build_bundle(data=dict_strip_unicode_keys(object_data))
            self.is_valid(bundle, request)
        
            try:
                updated_bundle = self.obj_update(bundle, request=request, pk=kwargs.get('pk'))
                bundles_seen.append(updated_bundle)
                #return self.build_response(request, updated_bundle) #return HttpAccepted()
            except Exception, err:
                print err
                updated_bundle = self.obj_create(bundle, request=request, pk=kwargs.get('pk'))
                bundles_seen.append(updated_bundle)
                #return self.build_response(request, updated_bundle) #return HttpCreated(location=self.get_resource_uri(updated_bundle))
        
        return self.build_list_response(request, bundles_seen)