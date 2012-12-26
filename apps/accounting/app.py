# -*- coding: utf-8 -*-


from core.app import BaseApp


class AccountingApp(BaseApp):

    urls_conf = 'accounting.urls'

    def callback(self, *args, **kwargs):
        pass
        # print "callback inside accounting"

application = AccountingApp


# from core.app.signals import app_load


# def on_app_load(sender, **kwargs):
#     print "inside accounting app", kwargs


# app_load.connect(on_app_load, sender=AccountingApp)
