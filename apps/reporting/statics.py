# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('reportapp')
class ReportApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        # 'app/reporting/models.js',
        'app/reporting/ReportTree.js',
        'app/reporting/FilterPanel.js',
        'app/reporting/PrintPanel.js',
        'app/reporting/ReportApp.js',
    ]
