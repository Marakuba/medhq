# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('assistant')
class AssistantApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/assistant/js/AssistantGrid.js',
        'app/assistant/js/AssistantTicket.js',
        'app/assistant/js/AssistantWindow.js',
    ]
    depends_on = ['examordergrid', 'webapp3', ]
