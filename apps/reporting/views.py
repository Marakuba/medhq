# -*- coding: utf-8 -*-
from django.views.generic.simple import direct_to_template
from visit.models import Visit, OrderedService
from django.db.models.aggregates import Sum, Count

from base import Report
from visit.settings import PAYMENT_TYPES
import reporting
from reporting.forms import ReportForm
from django.shortcuts import render_to_response, get_object_or_404
from django.template.context import RequestContext
#from visit.forms import ReportForm
import datetime
from django.views.decorators.cache import cache_control
from django import forms
from django.contrib.auth.decorators import login_required, permission_required
from operator import itemgetter
from reporting.base import Node
from reporting.models import Report as ReportConfig
from django.db import connection



@login_required
@permission_required('pricelist.add_price')
@cache_control(no_cache=True)
def report_list(request):
    form = ReportForm()
    return render_to_response('reporting/list.html', {'form': form,
                                                      'title':u'Панель отчетов',
                                                      'today':datetime.date.today()}, 
                              context_instance=RequestContext(request))
    
@login_required
@permission_required('pricelist.add_price')
@cache_control(no_cache=True)
def test_report_list(request):
    form = ReportForm()
    return render_to_response('reporting/test_list.html', {'form': form,
                                                      'title':u'Панель отчетов',
                                                      'today':datetime.date.today()}, 
                              context_instance=RequestContext(request))

def test_print_report(request, slug):
    
    report_config = get_object_or_404(ReportConfig, slug=slug, is_active=True)
    formclass = report_config.get_form()
    report_config.get_fields()
    report = reporting.get_report(slug)(request=request,
                                        query=report_config.get_sql(),
                                        request_filters='GET',
                                        formclass = formclass)
    return render_to_response([report_config.template,'reporting/price-dynamic-test.html','reporting/base.html'], 
                              {
                                'name':report_config.name,
                                'report':report,
                              },
                              context_instance=RequestContext(request))
    
def print_report(request, slug):
    from django.db import connection
    
    report = reporting.get_report(slug)(request,slug)
    results = report.prep_data()
    #
    form = ReportForm(report.trim_params)
    dh = []
    for field_id,field in form.fields.items():
        dh.append((field_id,field.label))

    np = []
    for key,values in report.trim_params.items():
        if isinstance(form.fields[key],forms.ChoiceField):
            d = dict(form.fields[key].choices)
            params = report.trim_params[key]
            if isinstance(form.fields[key],forms.ModelChoiceField):
                params = int(params)
            np.append((key,d.get(params)))
        else:
            np.append((key,report.trim_params[key]))
   
#    print report.prep_query_str()
    #..
    return render_to_response('reporting/%s.html'%slug ,{ 'results': report.make(results)
                                                        ,'name':report.verbose_name
                                                        ,'trim_params':report.chkeys(dict(np),dict(dh)).items()
                                                        }, context_instance=RequestContext(request))
    
def prep_data(request,query_str):
    params = dict(request.GET.items())
    trim_params = dict(filter(lambda x: x[1] is not u'',params.items()))
    cursor = connection.cursor()
    cursor.execute(prep_query_str(params,query_str))
    results = cursor.fetchall()
    cursor.close ()
#    import pdb; pdb.set_trace()
    return results

def prep_query_str(params,query_str):    
#    print params
    s_price_type = ''
    if str(params['price_type']) is not '':
        s_price_type = "and Tpr.price_type = '%s'"% (params['price_type'])
    result =  query_str % (params['start_date'],params['end_date'],s_price_type)
    return result 
#    order__cls = ''
#    s_price_type = ''
#    if str(params['price_type']) is not '':
#        s_price_type = "and Tpr.price_type = '%s'"% (params['price_type'])
#    if params['order__cls'] is not u'':
#        order__cls = u"and Tvis.cls = '%s'"% (params['order__cls'])
#    order__patient = ''
#    if params['order__patient'] is not u'':
#        order__patient = u"and Tvis.patient_id = '%s'"% (params['order__patient'])
#    staff__staff = ''
#    if params['staff__staff'] is not u'':
#        staff__staff = u"and Tstaff.id = '%s'"% (params['staff__staff'])
#    staff__department = ''
#    if params['staff__department'] is not u'':
#        staff__department = u"and Tdpr.id = '%s'"% (params['staff__department'])
#    order__referral = ''
#    if params['order__referral'] is not u'':
#        order__referral = u"and Tvis.referral_id = '%s'"% (params['order__referral'])
#    from_place_filial = ''
#    if params['from_place_filial'] is not u'':
#        from_place_filial = u"and Tvis.office_id = '%s'"% (params['from_place_filial'])
#    execution_place_office = ''
#    if params['execution_place_office'] is not u'':
#        execution_place_office = u"and Tstgr.id = '%s'"% (params['execution_place_office'])
#    execution_place_filial = ''
#    if params['execution_place_filial'] is not u'':
#        execution_place_filial = u"and TTvis.execution_place_id = '%s'"% (params['execution_place_filial'])
#    order__payment_type = ''
#    if params['order__payment_type'] is not u'':
#        order__payment_type = u"and Tvis.payment_type = '%s'"% (params['order__payment_type'])
#    if str(params['price_type']) is not '':
#        s_price_type = "and Tpr.price_type = '%s'"% (params['price_type'])
#    print query_str
#    return query_str % (params['start_date']
#                            ,params['end_date']
#                            ,order__cls
#                            ,order__patient
#                            ,staff__staff
#                            ,staff__department
#                            ,order__referral
#                            ,from_place_filial
#                            ,execution_place_office
#                            ,execution_place_filial
#                            ,order__payment_type
#                            ,s_price_type
#                            )   