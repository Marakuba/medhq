# -*- coding: utf-8 -*-


from core.app import BaseApp
from oldreporting import autodiscover


class OldReportingApp(BaseApp):

    urls_path = 'old/reporting'
    urls_conf = 'oldreporting.urls'

    def callback(self, *args, **kwargs):
        autodiscover()

application = OldReportingApp
