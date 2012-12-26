# -*- coding: utf-8 -*-


from core.app import BaseApp


class ExaminationApp(BaseApp):

    urls_path = 'exam'  # TODO: переименовать
    urls_conf = 'examination.urls'

application = ExaminationApp

# from core.app.signals import app_load


# def on_app_load(sender, **kwargs):
#     print "inside examination app", kwargs


# app_load.connect(on_app_load, sender=ExaminationApp)
