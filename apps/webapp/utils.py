# -*- coding: utf-8 -*-

import simplejson
from django_assets import Bundle, register
from django.db.models import Q
from webassets.env import RegisterError
from .models import Viewport
from .base import get_webapp
try:
    from collections import OrderedDict
except:
    from ordereddict import OrderedDict


def get_vp_for_user(user):
    qs = Viewport.objects.filter(is_active=True)
    if user.is_superuser:
        return qs
    groups = user.groups.get_query_set()
    qs = qs.complex_filter(Q(groups__in=groups) | Q(users__in=[user]))
    return qs.distinct()


def get_app_list(request, to_json=False):
    vp_list = get_vp_for_user(request.user)
    apps = [(v.name, "/webapp/%s/" % v.slug) for v in vp_list]
    if request.user.is_staff or request.user.is_superuser:
        apps.append([u'Администрирование', u'/admin/'])
    if to_json:
        apps = simplejson.dumps(apps)
    return apps


def build_dependings(xtype, request, vp):
    webapp = get_webapp(xtype)()

    js = []
    css = []
    options = {}

    if webapp.js:
        js.extend(webapp.js)
    if webapp.css and 'all' in webapp.css:
        css.extend(webapp.css['all'])
    options.update(webapp.options(request=request, vp=vp))

    deps = webapp.depends_on
    if deps:
        for d in deps:
            js_assets, css_assets, dep_options = build_dependings(d, request, vp)
            js = js_assets + js
            css = css_assets + css
            options.update(dep_options)

    return js, css, options


def build_static(request, vp):
    apps = vp.viewportapp_set.all().values_list('xtype', flat=True)
    js = []
    css = []
    options = {}

    for app in apps:
        js_assets, css_assets, dep_options = build_dependings(app, request, vp)
        if js_assets:
            js.extend(js_assets)
        if css_assets:
            css.extend(css_assets)
        if dep_options:
            options.update(dep_options)

    js = list(OrderedDict.fromkeys(js))
    css = list(OrderedDict.fromkeys(css))

    js_bundle = Bundle(*js, filters='rjsmin', output="assets/%s_%s.js" % (vp.slug, request.user.id))
    css_bundle = Bundle(*css, filters=('cssrewrite', 'cssmin'), output="assets/%s_%s.css" % (vp.slug, request.user.id))

    js_bundle_name = 'webapp_%s_js' % vp.slug
    css_bundle_name = 'webapp_%s_css' % vp.slug

    try:
        register(js_bundle_name, js_bundle)
    except RegisterError:
        pass
    try:
        register(css_bundle_name, css_bundle)
    except RegisterError:
        pass

    return js_bundle_name, css_bundle_name, options
