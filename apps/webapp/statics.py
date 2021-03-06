# -*- coding: utf-8 -*-

import simplejson
from webapp.base import BaseWebApp, register, get_webapp
from webapp.utils import get_app_list
from django.conf import settings
from constance import config

from state.api import MedStateResource


debug = settings.DEBUG and '-debug' or ''


@register('extjs3')
class ExtJS3(BaseWebApp):

    js = [
        'extjs/adapter/ext/ext-base.js',
        'extjs/ext-all-debug.js',
        'extjs/src/locale/ext-lang-ru.js',
    ]
    css = {
        'all': [
            'extjs/resources/css/ext-all.css',
        ]
    }


@register('extjs3-ux')
class ExtJS3UX(BaseWebApp):

    js = [
        'extjs/ux/CheckColumn.js',
        'extjs/ux/progresscolumn/ProgressColumn.js',
        'extjs/ux/RowEditor.js',
        'extjs/ux/SearchField.js',
        'extjs/ux/Spinner.js',
        'extjs/ux/SpinnerField.js',
        'extjs/ux/treegrid/TreeGridSorter.js',
        'extjs/ux/treegrid/TreeGridColumnResizer.js',
        'extjs/ux/treegrid/TreeGridColumns.js',
        'extjs/ux/treegrid/TreeGridLoader.js',
        'extjs/ux/treegrid/TreeGridNodeUI.js',
        'extjs/ux/treegrid/TreeGrid.js',
        'extjs/ux/PortalColumn.js',
        'extjs/ux/Portal.js',

        'libs/underscore-min.js',
    ]
    css = {
        'all': [
            'extjs/ux/css/RowEditor.css',
            'extjs/ux/css/Spinner.css',
            'extjs/ux/progresscolumn/ProgressColumn.css',
            'extjs/ux/treegrid/treegrid.css',
        ]
    }


def get_states(to_json=True):
    ms = MedStateResource()
    ms_data = ms.obj_get_list()
    data = []
    for obj in ms_data:
        bundle = ms.build_bundle(obj=obj)
        data.append(ms.full_dehydrate(bundle))

    if to_json:
        data = ms.serialize(None, data, 'application/json')
    return data


def get_app_opts(app):
    opts = {
        'xtype': app.xtype,
        'is_default': app.is_default,
        'tbar_group': app.tbar_group,
        'splitter': app.splitter,
        'cmp_type': get_webapp(app.xtype).cmp_type,
        'config': app.config
    }
    return opts


@register('webapp3')
class WebApp3(BaseWebApp):

    js = [
        'app/webapp/Utils.js',
        'app/webapp/MainPanel.js',
        'app/webapp/CentralPanel.js',
        'app/webapp/WebApp.js',

        'app/data/RestStore.js',
        'app/form/ClearableComboBox.js',
        'app/form/LazyComboBox.js',
        'app/ux/InputTextMask.js',
    ]
    css = {
        'all': [
            'resources/css/app.css',
            'resources/css/silk.css'
        ]
    }
    depends_on = ['extjs3-ux', 'extjs3', ]

# test: assert options() returns dict

    def options(self, *args, **kwargs):
        request = kwargs['request']
        vp = kwargs['vp']
        apps = map(get_app_opts, vp.viewportapp_set.all())
        profiles = [(p.id, p.profile) for p in request.user.get_profile().position_set.active()]
        extra_settings = {
            'startHour': config.START_HOUR,
            'endHour': config.END_HOUR,
            'showAlerts': config.REGISTRY_SHOW_ALERTS,
            'examCardEditable': config.EXAM_CARD_EDITABLE,
        }
        return {
            'appPool': get_app_list(request, to_json=True),
            'apps': simplejson.dumps(apps),
            'MedStates': get_states(),
            'active_profile': request.active_profile.id,
            'active_state': "'%s'" % request.active_profile.department.state,
            'active_state_id': request.active_profile.department.state.id,
            'active_user': "'%s'" % request.user,
            'active_staff': request.active_profile.staff.id,
            'state': request.active_profile.state,
            'MEDIA_URL': "'%s'" % settings.STATIC_URL,
            'API_URL': "'%s'" % '/api',  # откуда брать?
            'profiles': simplejson.dumps(profiles),
            'settings': simplejson.dumps(extra_settings)

        }


@register('profileWidget')
class ProfileWidgetApp(BaseWebApp):

    cmp_type = 'widget'
    js = [
        'app/webapp/widgets/ProfileWidget.js',
    ]
    depends_on = ['webapp3', ]


@register('globalsearchfield')
class GlobalSearchFieldApp(BaseWebApp):

    cmp_type = 'widget'
    js = [
        'app/ux/GSearchField.js',
        'app/webapp/widgets/GlobalSearch.js',
    ]
    depends_on = ['webapp3', ]
