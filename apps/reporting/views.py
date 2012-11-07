# -*- coding: utf-8 -*-

from django.contrib.auth.decorators import login_required, permission_required
from django.shortcuts import render_to_response, get_object_or_404
from django.template.context import RequestContext
from django.views.decorators.cache import cache_control
from reporting.forms import ReportForm
from reporting.models import Report as ReportConfig
import datetime
import reporting


@login_required
@permission_required('pricelist.add_price')
@cache_control(no_cache=True)
def report_list(request):
    form = ReportForm()
    ctx = {
        'form': form,
        'title': u'Панель отчетов',
        'today': datetime.date.today()
    }
    return render_to_response('reporting/test_list.html', ctx,
                              context_instance=RequestContext(request))


def print_report(request, slug):

    report_config = get_object_or_404(ReportConfig, slug=slug, is_active=True)
    formclass = report_config.get_form()
    report_config.get_fields()
    report = reporting.get_report(slug)(request=request,
                                        query=report_config.get_sql(),
                                        request_filters='GET',
                                        formclass=formclass)
    ctx = {
        'name': report_config.name,
        'report': report,
        'header': 1
    }
    tpl = u'reporting/%s.html' % report_config.slug
    return render_to_response([report_config.template, tpl, 'reporting/base.html'],
                              ctx,
                              context_instance=RequestContext(request))
