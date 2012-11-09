# -*- coding: utf-8 -*-


from core.app import BaseApp


class OldReportingApp(BaseApp):

    urls_path = 'old/reporting'
    urls_conf = 'oldreporting.urls'

    def callback(self, *args, **kwargs):
        print "callback inside oldreporting"

application = OldReportingApp
