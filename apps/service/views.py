# -*- coding: utf-8 -*-

from django.views.generic.simple import direct_to_template
from service.models import BaseService, EXECUTION
from service.forms import HelperFormSet
from django.http import HttpResponse

def price_list_helper(request):
    """
    """
    if request.method == 'POST':
        formset = HelperFormSet(request.POST, request.FILES)
        if formset.is_valid():
            # do something with the formset.cleaned_data
            return HttpResponse("form is valid")
        else:
            output = []
            for error in formset.errors:
                print error
            return HttpResponse("form is not valid:")
    else:
        formset = HelperFormSet()
    
    
    services = BaseService.objects.all().order_by(BaseService._meta.tree_id_attr, #@UndefinedVariable
                                                  'level', 
                                                  "-"+BaseService._meta.left_attr) #@UndefinedVariable
    
    extra_context = {'services':services,
                     'exec_form':EXECUTION}
    return direct_to_template(request, "print/service/pricelist.html", extra_context=extra_context)



def service_list(request):
    """
    """

    services = BaseService.objects.actual().filter(base_group__id=4).order_by(BaseService._meta.tree_id_attr, #@UndefinedVariable
                                                  'level', 
                                                  "-"+BaseService._meta.left_attr) #@UndefinedVariable
    
    extra_context = {'services':services}
    return direct_to_template(request, "helpers/service/list.html", extra_context=extra_context)