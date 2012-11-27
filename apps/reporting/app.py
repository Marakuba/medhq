# -*- coding: utf-8 -*-


from core.app import BaseApp
from reporting import autodiscover


class ReportingApp(BaseApp):

    urls_conf = 'reporting.urls'

    def callback(self, *args, **kwargs):
        autodiscover()

application = ReportingApp
