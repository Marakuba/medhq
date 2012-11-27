# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('patient-choicer')
class PatientChoicerApp(BaseWebApp):

    js = [
        'app/patient/choicer/PatientChoiceGrid.js',
        'app/patient/choicer/PatientChoiceWindow.js',
    ]

    depends_on = ['patientapp', ]


@register('patientapp')
class PatientApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/patient/models.js',
        'app/patient/insurance/PolicyGrid.js',
        'app/patient/insurance/PolicyWindow.js',
        'app/patient/insurance/StateGrid.js',
        'app/patient/insurance/StateWindow.js',
        'app/patient/clientaccount/ClientAccountGrid.js',
        'app/patient/ContractGrid.js',
        'app/patient/NotifyForm.js',
        'app/patient/IDCardForm.js',
        'app/patient/PatientForm.js',
        'app/patient/PatientWindow.js',
        'app/patient/PatientGrid.js',
        'app/patient/PatientCard.js',
        'app/patient/PatientApp.js',
    ]
    depends_on = ['samplingeditor', ]
