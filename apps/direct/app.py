# -*- coding: utf-8 -*-


from core.app import BaseApp
from direct import autodiscover


class ExtDirectApp(BaseApp):
    """
    """

    urls_conf = 'direct.urls'

    def callback(self):
        autodiscover()


application = ExtDirectApp
