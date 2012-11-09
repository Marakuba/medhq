# -*- coding: utf-8 -*-
from django.utils import simplejson
from django.http import HttpResponse, HttpResponseRedirect
from service.models import BaseService, ExtendedService
from django.db import connection

from patient.models import Patient
from django.shortcuts import get_object_or_404, render_to_response
from pricelist.models import Discount
from django.db.models import Q
from django.contrib.auth import login

from annoying.decorators import render_to
from django.contrib.auth.forms import AuthenticationForm

from django.views.generic.simple import direct_to_template
from django.contrib.auth.decorators import login_required
from lab.models import Sampling
from django.views.decorators.gzip import gzip_page
from state.models import State


import logging

from staff.models import Staff
from examination.models import FieldSet, SubSection, Questionnaire
from examination.widgets import get_widget

try:
    from collections import OrderedDict
except:
    from ordereddict import OrderedDict

logger = logging.getLogger('general')


def get_apps(request):
    apps = []
    if request.user.has_perm('visit.add_visit') or request.user.is_superuser:
        apps.append([u'Регистратура',u'/webapp/registry/'])
    if request.user.has_perm('lab.change_laborder') or request.user.is_superuser:
        apps.append([u'Лаборатория',u'/webapp/laboratory/'])
    if request.user.has_perm('examination.add_examinationcard') or request.user.is_superuser:
        apps.append([u'Обследования',u'/webapp/examination/'])
    if request.user.has_perm('accounting.add_contract') or request.user.is_superuser:
        apps.append([u'Юридические лица',u'/webapp/accounting/'])
    if request.user.is_superuser:
        apps.append([u'Отчеты',u'/webapp/reporting/'])
    apps.append([u'Штрих-коды',u'/webapp/barcoding/'])
    if request.user.is_staff or request.user.is_superuser:
        apps.append([u'Администрирование',u'/admin/'])

    return apps


def auth(request, authentication_form=AuthenticationForm):

    if request.method == "POST":
        form = authentication_form(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)

            if request.session.test_cookie_worked():
                request.session.delete_test_cookie()

            response = {
                'success': True
            }
            active_profile = getattr(request, 'active_profile', None)
            if active_profile:
                next_url = request.POST.get('next', None)
                response['redirect_to'] = u'/webapp/setactiveprofile/%d/%s' % (active_profile.id, next_url and u'?redirect_to=%s' % next_url or u'')
            else:
                response = {
                    'success': False,
                    'message': u'Ошибка авторизации: не задан профиль пользователя'
                }
        else:
            response = {
                'success': False,
                'message': u'Ошибка авторизации'
            }
        return HttpResponse(simplejson.dumps(response), mimetype="application/json")
    else:
        request.session.set_test_cookie()
        return direct_to_template(request, template='webapp/auth/index.html')


@login_required
def set_active_profile(request, position_id):
    request.session['ACTIVE_PROFILE'] = position_id
    redirect_to = request.GET.get('redirect_to', '/webapp/cpanel/')
    return HttpResponseRedirect(redirect_to=redirect_to)


@login_required
@render_to('webapp/cpanel/index.html')
def cpanel(request):
    perms = {
        'registry':request.user.has_perm('visit.add_visit') or request.user.is_superuser,
        'laboratory':request.user.has_perm('lab.change_laborder') or request.user.is_superuser,
        'examination':request.user.has_perm('examination.add_examinationcard') or request.user.is_superuser,
        'accounting':request.user.has_perm('accounting.add_contract') or request.user.is_superuser,
        'reporting':request.user.is_superuser,
        'admin':request.user.is_staff or request.user.is_superuser,
    }
    return {
        'perms':simplejson.dumps(perms)
    }


@login_required
@render_to('webapp/registry/index.html')
def registry(request):
    return {
        'apps':simplejson.dumps(get_apps(request))
    }


@login_required
@render_to('webapp/service/index.html')
def service(request):
    return {}


@login_required
@render_to('webapp/testing/index.html')
def testing(request):
    return {}


@login_required
@render_to('webapp/reporting/index.html')
def reporting(request):
    return {
        'apps':simplejson.dumps(get_apps(request))
    }

@login_required
@render_to('webapp/barcoding/index.html')
def barcoding(request):
    return {
        'apps':simplejson.dumps(get_apps(request))
    }


@login_required
@render_to('webapp/laboratory/index.html')
def laboratory(request):
    return {
        'apps':simplejson.dumps(get_apps(request))
    }

@login_required
@render_to('webapp/accounting/index.html')
def accounting(request):
    return {
        'apps':simplejson.dumps(get_apps(request))
    }

@login_required
@render_to('webapp/examination/index.html')
def examination(request):
    section_scheme = OrderedDict()
    sections = FieldSet.objects.all()
    required_tickets = []
    for sec in sections:
        subsecs = SubSection.objects.filter(section=sec.id)
        section_scheme[sec.name] = {
                                    'order':sec.order,
                                    'title':sec.title,
                                    'name':sec.name,
                                    'items':[]
                                    }
        for subsec in subsecs:
            widget = get_widget(subsec.widget)(request,subsec.title,'')
            ticket = {'title':subsec.title,
                'order':sec.order,
                'xtype':subsec.widget,
                'value':'',
                'printable':True,
                'title_print':True,
                'private':False,
                'section':sec.name,
                'fixed':getattr(widget,'fixed', False),
                'required':getattr(widget,'required', False),
                'unique':getattr(widget,'unique', False)
            }
            if ticket['required']:
                required_tickets.append(ticket)
            else:
                section_scheme[sec.name]['items'].append(ticket)
    quests = Questionnaire.objects.all()
    questionnaires = [{'name':quest.name,
                      'code':quest.code
                      } for quest in quests]
    return {
        'section_scheme':simplejson.dumps(section_scheme),
        'questionnaires':simplejson.dumps(questionnaires),
        'required_tickets':simplejson.dumps(required_tickets),
        'apps':simplejson.dumps(get_apps(request))
    }

@login_required
@render_to('webapp/oldexam/index.html')
def oldexam(request):
    return {}

@login_required
@render_to('webapp/calendar/index.html')
def calendar(request):
    return {}


@login_required
@render_to('webapp/helpdesk/index.html')
def helpdesk(request):
    return {}

# переносим в настройки внутри JS-объекта

@render_to('webapp/settings/app.js')
def js_settings(request):
    return {}
