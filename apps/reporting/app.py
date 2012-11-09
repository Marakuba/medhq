# -*- coding: utf-8 -*-


from core.app import BaseApp


class ReportingApp(BaseApp):

    urls_conf = 'reporting.urls'

application = ReportingApp
