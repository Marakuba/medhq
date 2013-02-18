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
from tastypie.http import HttpBadRequest
from annoying.decorators import render_to
from lab.utils import make_lab
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

    custom_orders = visit.orderedservice_set.exclude(service__inner_template='')

    service_blanks = ",".join([str(blank.id) for blank in custom_orders])

    custom_blanks = []

    if service_blanks:
        custom_blanks.append("/visit/print/custom_blank/?%s" % service_blanks)

    lab_orders = visit.orderedservice_set.filter(service__labservice__isnull=False)

    if lab_orders.count():
        custom_blanks.append("/visit/print/lab_agreement/%s/" % visit_id)

    extra_context = {
        'patient':patient,
        'contract':contract,
        'f':patient.is_f() and u"а" or u"",
        'ff':patient.is_f() and u"на" or u"ен",
        'visit':visit,
        'services':visit.orderedservice_set.all(),
        'state':request.active_profile.department.state,
        'custom_blanks':",".join(['"%s"' % b for b in custom_blanks])
    }

    # print "print/visit/visit_state_%s.html" % visit.office.id

    return render_to_response(["print/visit/visit_state_%s.html" % visit.office.id,"print/visit/visit.html"],
                              extra_context,
                              context_instance=RequestContext(request))


def lab_agreement(request, visit_id):

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
        'state':request.active_profile.department.state,
    }

    return render_to_response(["print/visit/lab_agreement_state_%s.html" % visit.office.id,"print/visit/lab_agreement.html"],
                              extra_context,
                              context_instance=RequestContext(request))


@render_to("print/visit/custom_blank.html")
def custom_blank(request):
    id_list = request.META['QUERY_STRING'].split(',')
    orders = OrderedService.objects.filter(id__in=id_list)
    renders = []
    for order in orders:
        c = RequestContext(request, {'order':order})
        t = loader.get_template(order.service.inner_template)
        renders.append([t.render(c),order])
    ctx = {
        'renders':renders
    }
    return ctx


def sampling(request, visit_id):
    visit = get_object_or_404(Visit, pk=visit_id)
    try:
        ordered_services = visit.orderedservice_set.all()
        for ordered_service in ordered_services:
            make_lab(ordered_service)
    except Exception, err:
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
