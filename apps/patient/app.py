# -*- coding: utf-8 -*-


from core.app import BaseApp


class PatientApp(BaseApp):

    urls_conf = 'patient.urls'

application = PatientApp
