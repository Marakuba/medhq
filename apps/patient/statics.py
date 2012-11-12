# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('patient-choicer')
class PatientChoicerApp(BaseWebApp):

    js = [
        'app/patient/PatientChoiceGrid.js',
        'app/patient/PatientChoiceWindow.js',
    ]
