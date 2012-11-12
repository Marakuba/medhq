# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('service-panel')
class ServicePanelApp(BaseWebApp):

    js = [
        'app/service/ServiceTreeGrid.js',
    ]
