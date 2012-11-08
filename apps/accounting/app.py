# -*- coding: utf-8 -*-


from core.app import BaseApp


class AccountingApp(BaseApp):

    urls = 'accounting.urls'

application = AccountingApp
