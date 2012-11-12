# -*- coding: utf-8 -*-

import simplejson
from django.http import HttpResponse, HttpResponseRedirect

from annoying.decorators import render_to
from django.shortcuts import get_object_or_404, render_to_response
from django.contrib.auth import login
from django.contrib.auth.forms import AuthenticationForm
from django.views.generic.simple import direct_to_template
from django.contrib.auth.decorators import login_required
from django.template import RequestContext

try:
    from collections import OrderedDict
except:
    from ordereddict import OrderedDict

from examination.models import FieldSet, SubSection, Questionnaire
from examination.widgets import get_widget

from .models import Viewport
from .utils import build_static, get_app_list
from .decorators import has_vp_perm


@login_required
@has_vp_perm
@render_to('webapp/viewport/base.html')
def viewport(request, slug):

    vp = get_object_or_404(Viewport, slug=slug)
    js_assets, css_assets, options = build_static(request, vp)
    opts = ",\n".join(["%s : %s" % (k, v) for k, v in options.iteritems()])
    ctx = {
        'vp': vp,
        'css_assets': css_assets,
        'js_assets': js_assets,
        'options': opts
    }
    tmpl = vp.template or 'webapp/viewport/base.html'
    return render_to_response(tmpl, ctx, \
                        context_instance=RequestContext(request))


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
    redirect_to = request.GET.get('redirect_to', request.META['HTTP_REFERER'])
    return HttpResponseRedirect(redirect_to=redirect_to)


@login_required
@render_to('webapp/cpanel/index.html')
def cpanel(request):
    return {
        'apps': get_app_list(request, to_json=True)
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
