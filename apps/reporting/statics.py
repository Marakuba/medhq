# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('reportapp')
class ReportApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        # 'app/reporting/models.js',
        'app/ux/GSearchField.js',
        'app/service/models.js',
        'app/choices/patient/PatientChoiceGrid.js',
        'app/choices/patient/PatientChoiceWindow.js',
        'app/choices/referral/ReferralChoiceGrid.js',
        'app/choices/referral/ReferralChoiceWindow.js',
        'app/choices/servicegroup/ServiceGroupChoiceGrid.js',
        'app/choices/servicegroup/ServiceGroupChoiceWindow.js',
        'app/choices/staff/StaffChoiceGrid.js',
        'app/choices/staff/StaffChoiceWindow.js',
        'app/choices/state/StateChoiceGrid.js',
        'app/choices/state/StateChoiceWindow.js',
        'app/reporting/ReportTree.js',
        'app/reporting/FilterPanel.js',
        'app/reporting/PrintPanel.js',
        'app/reporting/ReportApp.js',
    ]
    depends_on = ['webapp3', ]
