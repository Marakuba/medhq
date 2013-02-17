# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('calculationgrid')
class CalculationGridApp(BaseWebApp):

    verbose_name = u'Начисления бонусов'
    cmp_type = 'action'
    js = [
        'app/bonus/CalculationForm.js',
        'app/bonus/CalculationWindow.js',
        'app/bonus/CalculationItemGrid.js',
        'app/bonus/CalculationGrid.js',
    ]
    depends_on = ['webapp3', ]
