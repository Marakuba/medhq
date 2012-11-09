# -*- coding: utf-8 -*-


from core.app import BaseApp


class RemotingApp(BaseApp):

    urls_conf = 'remoting.urls'

application = RemotingApp
