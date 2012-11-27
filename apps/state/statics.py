# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('state-choicer')
class StateChoicerApp(BaseWebApp):

    js = [
        'app/state/StateChoiceGrid.js',
        'app/state/StateChoiceWindow.js',
    ]
