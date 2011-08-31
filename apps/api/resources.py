# -*- coding: utf-8 -*-

from tastypie.resources import ModelResource
from tastypie.utils.dict import dict_strip_unicode_keys
from django.http import HttpResponse

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
        return HttpResponse(content=serialized, 
                            content_type="text/html",#build_content_type(desired_format),
                            status=status)
       
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
        #import pdb; pdb.set_trace()
        
        try:
            updated_bundle = self.obj_update(bundle, request=request, pk=kwargs.get('pk'))
            return self.build_response(request, updated_bundle) #return HttpAccepted()
        except:
            updated_bundle = self.obj_create(bundle, request=request, pk=kwargs.get('pk'))
            return self.build_response(request, updated_bundle) #return HttpCreated(location=self.get_resource_uri(updated_bundle))
        
    