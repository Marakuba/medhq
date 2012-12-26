# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('barcodepackage')
class BarcodePackageApp(BaseWebApp):

    js = [
        'resources/js/web-socket-js/swfobject.js',
        'resources/js/web-socket-js/web_socket.js',
        'app/barcodepackage/PrintUtils.js',
        'app/barcodepackage/DuplicateWindow.js',
    ]
    depends_on = ['webapp3', ]


@register('barcodepackagegrid')
class BarcodePackageGridApp(BaseWebApp):

    verbose_name = u'Серии штрих-кодов'
    cmp_type = 'action'
    js = [
        'app/barcodepackage/BarcodePackageForm.js',
        'app/barcodepackage/BarcodePackageWindow.js',
        'app/barcodepackage/BarcodePackagePrintWindow.js',
        'app/barcodepackage/BarcodePackageGrid.js',
    ]
    depends_on = ['barcodepackage', ]


@register('barcodeduplicate')
class BarcodeDuplicateApp(BaseWebApp):

    cmp_type = 'action'
    depends_on = ['barcodepackage', ]
