# -*- coding: utf-8 -*-
from django.views.generic.simple import direct_to_template
from visit.models import Visit, OrderedService
from django.db.models.aggregates import Sum, Count

from base import Report
from visit.settings import PAYMENT_TYPES
import reporting
from reporting.forms import ReportForm
from django.shortcuts import render_to_response
from django.template.context import RequestContext
#from visit.forms import ReportForm
import datetime
from django.views.decorators.cache import cache_control
from django import forms



#def payments(request):
#    form = PaymentForm()
#    report = PatientReport(request)
#    extra_context = {
#                     'form':form,
#                     }
#    extra_context.update(report.get_results())
#    return direct_to_template(request, 
#                              template="reports/payments.html", 
#                              extra_context=extra_context)
    

@cache_control(no_cache=True)
def report_list(request):
    form = ReportForm()
    return render_to_response('reporting/list.html', {'form': form,
                                                      'title':u'Панель отчетов',
                                                      'today':datetime.date.today()}, 
                              context_instance=RequestContext(request))

def print_report(request, slug):
    from django.db import connection
    
    report = reporting.get_report(slug)(request)
    cursor = connection.cursor()
    cursor.execute(report.prep_query_str())
    results = cursor.fetchall()
    cursor.close ()
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
    return render_to_response('reporting/%s.html'%slug ,{  'results': report.make(results)
                                                        ,'name':report.verbose_name
                                                        ,'trim_params':report.chkeys(dict(np),dict(dh)).items()
                                                        }
                                ,context_instance=RequestContext(request))