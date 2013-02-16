# -*- coding: utf-8 -*-


from core.app import BaseApp


class BonusApp(BaseApp):

    urls_conf = 'bonus.urls'


application = BonusApp
