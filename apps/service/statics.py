# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register
import simplejson

from service.models import BS_TYPES
from lab.models import WIDGET_CHOICES


@register('service-panel')
class ServicePanelApp(BaseWebApp):

    js = [
        'app/service/ServiceTreeGrid.js',
    ]


@register('serviceapp')
class ServiceApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/service/ServiceApp.js',
    ]
    depends_on = ['service-panel', ]


@register('servicemanager')
class ServiceManager(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/ux/GSearchField.js',
        'app/choices/staff/StaffChoiceGrid.js',
        'app/choices/staff/StaffChoiceWindow.js',
        'app/choices/state/StateChoiceGrid.js',
        'app/choices/state/StateChoiceWindow.js',
        'app/choices/tube/TubeChoiceGrid.js',
        'app/choices/tube/TubeChoiceWindow.js',
        'extjs/ux/MultiSelect.js',
        'extjs/ux/ItemSelector.js',
        'app/service/models.js',
        'app/service/servicemanager/ServiceTree.js',
        'app/service/servicemanager/LabServiceForm.js',
        'app/service/servicemanager/ExtServiceForm.js',
        'app/service/servicemanager/ExtServiceGrid.js',
        'app/service/servicemanager/ExtServicePanel.js',
        'app/service/servicemanager/BaseServiceForm.js',
        'app/service/servicemanager/SelectedServiceGrid.js',
        'app/service/servicemanager/ServiceManager.js',

    ]
    depends_on = ['webapp3', 'analysiseditorapp']

    def options(self, *args, **kwargs):

        types = map(lambda x: list(x), BS_TYPES)
        types = [t for t in types if not t[0] == u'group']
        lab_widgets = map(lambda x: list(x), WIDGET_CHOICES)
        return {
            'bs_types': simplejson.dumps(types),
            'lab_widgets': simplejson.dumps(lab_widgets),
        }
