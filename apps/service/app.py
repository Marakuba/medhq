# -*- coding: utf-8 -*-


from core.app import BaseApp


class ServiceApp(BaseApp):

    urls_conf = 'service.urls'

application = ServiceApp
