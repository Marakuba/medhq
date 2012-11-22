# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


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
