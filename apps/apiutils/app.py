# -*- coding: utf-8 -*-


from core.app import BaseApp


class ApiutilsApp(BaseApp):

    urls_path = 'api'
    urls_conf = 'apiutils.urls'

application = ApiutilsApp
