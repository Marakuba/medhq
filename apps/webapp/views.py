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
