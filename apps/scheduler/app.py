# -*- coding: utf-8 -*-


from core.app import BaseApp


class SchedulerApp(BaseApp):

    urls_conf = 'scheduler.urls'

application = SchedulerApp
