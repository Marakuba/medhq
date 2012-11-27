# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('paymentgrid')
class PaymentGridApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/billing/models.js',
        'app/billing/payment/PaymentForm.js',
        'app/billing/payment/PaymentWindow.js',
        'app/billing/payment/PaymentGrid.js',
    ]


@register('cashierapp')
class CashierApp(BaseWebApp):

    cmp_type = 'action'
    verbose_name = u'Кассир'
    js = [
        'app/cashier/models.js',
        'app/cashier/DebtorGrid.js',
        'app/cashier/DepositorGrid.js',
        'app/cashier/CashierApp.js'
    ]
