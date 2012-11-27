# -*- coding: utf-8 -*-


from core.app import BaseApp


class VisitApp(BaseApp):

    urls_conf = 'visit.urls'

application = VisitApp
