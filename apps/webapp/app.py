# -*- coding: utf-8 -*-


from core.app import BaseApp


class WebApp(BaseApp):

    urls_conf = 'webapp.urls'

    def callback(self, *args, **kwargs):
        print "callback inside webapp"

application = WebApp


# from core.app.signals import app_load


# def on_app_load(sender, **kwargs):
#     print "inside accounting app", kwargs


# app_load.connect(on_app_load, sender=AccountingApp)
