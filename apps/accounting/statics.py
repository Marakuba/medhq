# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('accounting')
class AccountingWebApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/data/RestStore.js',
        'app/form/ClearableComboBox.js',
        'app/form/LazyComboBox.js',
        'app/ux/GSearchField.js',
        'app/ux/InputTextMask.js',

        'app/accounting/models.js',

        'app/accounting/invoice/copier/CopierInvoiceGrid.js',
        'app/accounting/invoice/copier/CopierWindow.js',

        'app/accounting/invoice/PatientGrid.js',
        'app/accounting/invoice/InvoiceItemGrid.js',
        'app/accounting/invoice/InvoiceForm.js',
        'app/accounting/invoice/InvoiceGrid.js',
        'app/accounting/invoice/InvoiceApp.js',

        'app/accounting/contract/ContractForm.js',
        'app/accounting/contract/ContractWindow.js',
        'app/accounting/contract/ContractGrid.js',
        'app/accounting/contract/ContractApp.js'
    ]
    # css = {
    #     'all': []
    # }
    depends_on = ['service-panel', 'patient-choicer', 'state-choicer', 'webapp3', ]
