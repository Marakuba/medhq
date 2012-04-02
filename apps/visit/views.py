# -*- coding: utf-8 -*-

from django.shortcuts import get_object_or_404, render_to_response
import datetime
from django.views.generic.simple import direct_to_template
from visit.models import Visit, OrderedService
from lab.models import Sampling
from django.template import loader
from django.template.context import RequestContext
from django.db.models.aggregates import Sum

#from autocomplete.views import AutocompleteView
from staff.models import Position
from django.http import HttpResponseBadRequest
from extdirect.django.decorators import remoting
from direct.providers import remote_provider
import simplejson
from tastypie.http import HttpBadRequest
from service.exceptions import TubeIsNoneException
from state.models import State
#autocomplete = AutocompleteView('visit')

def all(request, visit_id):
    visit = get_object_or_404(Visit, pk=visit_id)
    visit.update_total_price()

    patient = visit.patient
    contract = patient.get_contract()
    
    samplings = Sampling.objects.filter(visit=visit)
    
    pages = []
    tubes = {}
    
    os_all = visit.orderedservice_set.all()
    
    for item in os_all:
        s = item.service
        if s.inner_template:
            ctx = {
                'inner_sampling':samplings.filter(tube__in=s.normal_tubes.all())[0],
                'service':item.service
            }
            l = loader.get_template(s.inner_template)
            c = RequestContext(request, ctx)
            t = l.render(c)
            pages.append(t)
            
            
            
    
    extra_context = {
        'patient':patient,
        'contract':contract,
        'samplings':samplings,
        'pages':pages,
        'f':patient.is_f() and u"а" or u"",
        'ff':patient.is_f() and u"на" or u"ен",
        'visit':visit,
        'services':visit.orderedservice_set.all()
    }
    return direct_to_template(request=request, 
                              template='print/visit/all.html', 
                              extra_context=extra_context)

def visit(request, visit_id):
    visit = get_object_or_404(Visit, pk=visit_id)
    visit.update_total_price()

    patient = visit.patient
    contract = patient.get_contract()
    
    extra_context = {
        'patient':patient,
        'contract':contract,
        'f':patient.is_f() and u"а" or u"",
        'ff':patient.is_f() and u"на" or u"ен",
        'visit':visit,
        'services':visit.orderedservice_set.all(),
        'state':request.active_profile.department.state
    }
    
    return render_to_response(["print/visit/visit_state_%s.html" % request.active_profile.state,"print/visit/visit.html"],
                              extra_context,
                              context_instance=RequestContext(request))

def sampling(request, visit_id):
    visit = get_object_or_404(Visit, pk=visit_id)
    try:
        visit.generate_laborder()
    except TubeIsNoneException, err:
        return HttpBadRequest(err.__unicode__())

    patient = visit.patient
    # выводим все пробирки в одной таблице
    samplings = Sampling.objects.filter(visit=visit).order_by('laboratory',)#.exclude(execution_type_group__id=3)
    tubes_count = samplings.aggregate(sum=Sum('tube_count'))
    bc_count = Sampling.objects.filter(visit=visit, laboratory__type='b', is_barcode=False).aggregate(sum=Sum('tube__bc_count'))
    
    extra_context = {
        'patient':patient,
        'visit':visit,
        #'services':visit.orderedservice_set.all(),
        'samplings':samplings,
        'tubes_count':tubes_count,
        'bc_count':bc_count
    }
#    return direct_to_template(request=request, 
#                              template='print/visit/sampling.html', 
#                              extra_context=extra_context)
    return render_to_response(["print/visit/sampling_state_%s.html" % request.active_profile.state,"print/visit/sampling.html"],
                              extra_context,
                              context_instance=RequestContext(request))
    
    
def daily_staff_report(request):
    position = get_object_or_404(Position, pk=request.GET.get('staff'))
    date = request.GET.get('date') #format: YYYY-MM-DD
    
    if not date:
        return HttpResponseBadRequest()
    
    year,month,day = date.split('-')
    
    date_from = datetime.datetime(int(year), int(month), int(day),0,0,0)
    date_till = datetime.datetime(int(year), int(month), int(day),23,59,59)
    
    ordered_services = OrderedService.objects.filter(staff=position, created__range=(date_from,date_till))
    ec = {
          'meta': {
            'date':date_from
        },
          'object_list':ordered_services
    }
    return direct_to_template(request=request, 
                              template="visit/daily_staff_report.html", 
                              extra_context=ec)


@remoting(remote_provider, len=1, action='visit', name='toLab')
def to_lab(request):
    """
    """
    data = simplejson.loads(request.raw_post_data)
    ids = data['data'][0]
    object_list = OrderedService.objects.filter(id__in=ids)
    for obj in object_list:
        obj.to_lab()
    return dict(success=True, data='some data')

@remoting(remote_provider, len=1, action='visit', name='setPaymentType')
def set_payment_type(request):
    data = simplejson.loads(request.raw_post_data)
    params = data['data'][0]
    visit_id = params['id']
    try:
        visit = Visit.objects.get(id=visit_id)
    except:
        return dict(success=False, data="cannot find visit %s" % visit_id)
    payer = params['payer'] or None
    if payer:
        try:
            payer = State.objects.get(id=params['payer'])
        except:
            return dict(success=False, data="cannot find payer %s" % params['payer'])
    try:
        visit.payment_type = params['ptype']
        visit.payer = payer 
        visit.insurance_policy = params['insurance_policy'] or None
        visit.save()
    except:
        return dict(success=False, data="cannot update visit %s: [payment_type: %s, payer: %s, policy: %s]" 
                    % (visit_id,params['ptype'],params['payer'], params['insurance_policy']))
    services = OrderedService.objects.filter(order=visit)
    [service.save() for service in services]
    return dict(success=True, data='visit saved')