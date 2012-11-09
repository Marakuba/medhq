# -*- coding: utf-8 -*-


from core.app import BaseApp


class LabApp(BaseApp):

    urls_conf = 'lab.urls'

application = LabApp
