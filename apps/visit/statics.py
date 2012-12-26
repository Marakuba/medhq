# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('cardvisitgrid')
class CardVisitGridApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'resources/js/web-socket-js/swfobject.js',
        'resources/js/web-socket-js/web_socket.js',
        'app/barcodepackage/PrintUtils.js',
        'app/visit/models.js',
        'app/visit/barcode/BarcodeChoiceGrid.js',
        'app/visit/barcode/BarcodeChoiceWindow.js',
        'app/visit/barcode/PrintGrid.js',
        'app/visit/barcode/PrintWindow.js',
        'app/visit/paymenttype/PaymentTypeChoiceWindow.js',
        'app/visit/card/CardVisitGrid.js',
        # 'app/visit/ExtraButton.js',
    ]


@register('cardservicegrid')
class CardServiceGridApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/visit/models.js',
        'app/visit/card/CardServiceGrid.js',
    ]


@register('referral')
class ReferralApp(BaseWebApp):

    js = [
        'app/referral/ReferralGrid.js',
        'app/referral/ReferralWindow.js'
    ]


@register('visitapp')
class CardServiceGridApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/visit/models.js',
        'app/patient/models.js',
        'app/scheduler/models.js',
        'app/preorder/PatientPreorderGrid.js',
        'app/visit/OrderedServiceInlineGrid.js',
        'app/visit/StaffGrid.js',
        'app/visit/StaffWindow.js',
        'app/visit/VisitForm.js',
        'app/visit/VisitGrid.js',
        'app/visit/VisitApp.js',
        'app/visit/VisitTab.js',
    ]
    depends_on = ['service-panel', 'referral', ]


@register('orderapp')
class OrderApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/orderedservice/LocalOrderGrid.js',
        'app/orderedservice/RemoteOrderGrid.js',
        'app/orderedservice/ResultWindow.js',
        'app/orderedservice/OrderApp.js',
    ]
