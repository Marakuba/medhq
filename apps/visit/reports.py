# -*- coding: utf-8 -*-

from django.db.models.aggregates import Count, Sum
from visit.models import OrderedService, Visit
from reporting import register, Report
from visit.settings import PAYMENT_TYPES
from visit.forms import CashReportForm, LabReportForm
from django.conf import settings


class PaymentReport(Report):
    queryset = OrderedService.objects.filter(order__is_billed=True)
    ordering = ['order__payment_type','order__referral__name']
    details_columns = ['order__created','order__patient__short_name','service','total_price']
    columns = ['order__referral','total_count','total_price']
    verbose_name = u'Тип оплаты / Кто направил / Услуги'
    groups = [
        # group 1
        (('order__payment_type',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('get_payment_type_display',1),
            ('total_count',1),
            ('total_sum',1)
        )),
        # group 2
        (('order__referral__name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('order__referral__name',1),
            ('total_count',1),
            ('total_sum',1)
        )),
#        (('service__name',),{
#            'total_count':Count('service')
#        }),
    ]
    show_details = 'top'
    
    def get_payment_type_display(self, obj):
        types = {}
        for item in PAYMENT_TYPES:
            types[item[0]] = item[1]
        return types[obj['order__payment_type']]

class LabReport(Report):
    queryset = OrderedService.objects.filter(order__is_billed=True)
    ordering = ['order__payment_type','order__referral__name']
    details_columns = ['order__created','order__patient__short_name','service','total_price']
    columns = ['order__referral','total_count','total_price']
    verbose_name = u'Тип оплаты / Место выполнения / Услуги'
    groups = [
        # group 1
        (('order__payment_type',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('get_payment_type_display',1),
            ('total_count',1),
            ('total_sum',1)
        )),
        # group 2
        (('execution_place__name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('execution_place__name',1),
            ('total_count',1),
            ('total_sum',1)
        )),
        # group 2
        (('service__name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('service__name',1),
            ('total_count',1),
            ('total_sum',1)
        )),
    ]
    show_details = None
    
    def get_payment_type_display(self, obj):
        types = {}
        for item in PAYMENT_TYPES:
            types[item[0]] = item[1]
        return types[obj['order__payment_type']]


class LabServiceReport(Report):
    queryset = OrderedService.objects.filter(service__execution_form=u'п')
    ordering = ['order__payment_type','order__referral__name']
    details_columns = ['order__created','order__patient__short_name','service','total_price']
    columns = ['order__referral','total_count','total_price']
    verbose_name = u'Лаборатории'
    form = LabReportForm
    total = (
        {
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('total_row_display',1),
            ('total_count',1),
            ('total_sum',1)
        )
    )
    groups = [
        # group 1
        (('execution_place__name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('execution_place__name',1),
            ('total_count',1),
            ('total_sum',1)
        )),
        (('order__payment_type',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('get_payment_type_display',1),
            ('total_count',1),
            ('total_sum',1)
        )),
        # group 2
        (('service__name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('service__name',1),
            ('total_count',1),
            ('total_sum',1)
        )),
    ]
    show_details = None
    
    def get_payment_type_display(self, obj):
        types = {}
        for item in PAYMENT_TYPES:
            types[item[0]] = item[1]
        return types[obj['order__payment_type']]

#    def get_payment_type_display(self, obj):
#        types = {}
#        for k in PAYMENT_TYPES:
#            types[k[0]]=k[1]
#        types.update({
#            u'л':u'Евромед Лузана',
#            u'н':u'Евромед КИМ'
#        })
#        return types[obj['order__payment_type']]

class LabServiceReferralReport(Report):
    queryset = OrderedService.objects.filter(service__execution_form=u'п', 
                                             execution_place__id=settings.MAIN_STATE_ID)
    ordering = ['order__payment_type','order__referral__name']
    details_columns = ['order__created','order__patient__short_name','service','total_price'] #
    columns = ['order__referral','total_count','total_price'] #
    verbose_name = u'Лаборатории Евромед / Кто направил / Тип оплаты / Услуги' #
    form = LabReportForm
    total = (
        {
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('total_row_display',1),
            ('total_count',1),
            ('total_sum',1)
        )
    )
    groups = [
        # group 1
        (('order__payment_type',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('get_payment_type_display',1),
            ('total_count',1),
            ('total_sum',1)
        )),
        # group 2
        (('order__referral__name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('order__referral__name',1),
            ('total_count',1),
            ('total_sum',1)
        )),
        # group 3
        (('service__name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('service__name',1),
            ('total_count',1),
            ('total_sum',1)
        )),
    ]
    show_details = None
    
    def get_payment_type_display(self, obj):
        types = {}
        for k in PAYMENT_TYPES:
            types[k[0]]=k[1]
        types.update({
            u'л':u'Евромед Лузана',
            u'н':u'Евромед КИМ'
        })
        return types[obj['order__payment_type']]

class StaffShortReport(Report):
    queryset = OrderedService.objects.filter(order__is_billed=True)
    ordering = ['staff',]
    details_columns = ['order__created','order__patient','total_price']
    columns = ['order__referral','total_count','total_price']
    verbose_name = u'Врачи'
    groups = [
        # group 1
        (('staff__staff__last_name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('staff__staff__last_name',1),
            ('total_count',1),
            ('total_sum',1)
        )),
    ]
    show_details = None

class StaffDetailsReport(Report):
    queryset = OrderedService.objects.filter(order__is_billed=True)
    details_ordering = ['order__created','order__patient__last_name','service']
    details_columns = ['order__created','order__patient__short_name','service','total_price']
    columns = ['order__referral','total_count','total_price']
    verbose_name = u'Врачи / Услуги'
    groups = [
        # group 1
        (('staff__staff__last_name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('staff__staff__last_name',1),
            ('total_count',1),
            ('total_sum',1)
        )),
    ]
    show_details = 'top'

class StaffWideReport(Report):
    queryset = OrderedService.objects.filter(order__is_billed=True)
    ordering = ['staff',]
    details_columns = ['order__created','order__patient','total_price']
    columns = ['order__referral','total_count','total_price']
    verbose_name = u'Врачи / Услуги / Стоимость'
    groups = [
        # group 1
        (('staff__staff__last_name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('staff__staff__last_name',1),
            ('total_count',1),
            ('total_sum',1)
        )),
        # group 2
        (('service__name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('service__name',1),
            ('total_count',1),
            ('total_sum',1)
        )),
    ]
    show_details = None

class USSWideReport(Report):
    queryset = OrderedService.objects.filter(service__execution_form=u'у',order__is_billed=True)
    ordering = ['staff',]
    details_columns = ['order__created','order__patient','total_price']
    columns = ['order__referral','total_count','total_price']
    verbose_name = u'УЗИ - Врачи / Услуги / Стоимость'
    groups = [
        # group 1
        (('staff__staff__last_name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('staff__staff__last_name',1),
            ('total_count',1),
            ('total_sum',1)
        )),
        # group 2
        (('service__name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('service__name',1),
            ('total_count',1),
            ('total_sum',1)
        )),
    ]
    show_details = None

class USSReferralReport(Report):
    queryset = OrderedService.objects.filter(service__execution_form=u'у',order__is_billed=True)
    ordering = ['order__payment_type','order__referral__name']
    details_columns = ['order__created','order__patient','total_price']
    columns = ['order__referral','total_count','total_price']
    verbose_name = u'УЗИ - Кто направил / Услуги / Сумма'
    groups = [
        # group 1
        (('order__referral__name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('order__referral__name',1),
            ('total_count',1),
            ('total_sum',1),
            ('discount1',1),
            ('discount2',1),
        )),
        # group 2
        (('service__name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('service__name',1),
            ('total_count',1),
            ('total_sum',1),
            ('discount1',1),
            ('discount2',1),
        )),
    ]
    show_details = None
    
    def discount1(self, obj):
        price = obj['total_sum']
        return float(price)*0.15

    def discount2(self, obj):
        price = obj['total_sum']
        return float(price)*0.20
    
    
class PatientReport(Report):
    queryset = OrderedService.objects.filter(order__is_billed=True)
    details_columns = ['order__created','order__patient','total_price']
    columns = ['order__referral','total_count','total_price']
    verbose_name = u'Пациенты / Услуги'
    groups = [
        # group 1
        (('order__patient__last_name','order__patient__first_name','order__patient__mid_name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('get_patient_short_name',1),
            ('total_count',1),
            ('total_sum',1)
        )),
        # group 2
        (('service__name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('service__name',1),
            ('total_count',1),
            ('total_sum',1)
        )),
    ]
    show_details = None
    
    def get_patient_short_name(self, obj):
        return u"%s %s.%s" % (obj['order__patient__last_name'], 
                              obj['order__patient__first_name'][0].capitalize(), 
                              obj['order__patient__mid_name'] and u" %s." % obj['order__patient__mid_name'][0].capitalize() or u'')

class ReferralReport(Report):
    queryset = OrderedService.objects.filter(order__is_billed=True, service__partnership=True)
    ordering = ['order__payment_type','order__referral__name']
    details_columns = ['order__created','order__patient','total_price']
    columns = ['order__referral','total_count','total_price']
    verbose_name = u'Кто направил / Услуги / Сумма'
    groups = [
        # group 1
        (('order__referral__name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('order__referral__name',1),
            ('total_count',1),
            ('total_sum',1),
            ('discount1',1),
            ('discount2',1),
        )),
        # group 2
        (('service__name',),{
            'total_count':Sum('count'),
            'total_sum':Sum('total_price')
        },(
            ('service__name',1),
            ('total_count',1),
            ('total_sum',1),
            ('discount1',1),
            ('discount2',1),
        )),
    ]
    show_details = None
    
    def discount1(self, obj):
        price = obj['total_sum']
        return float(price)*0.15

    def discount2(self, obj):
        price = obj['total_sum']
        return float(price)*0.20
    
class CashReport(Report):
    queryset = Visit.objects.filter(is_billed=True)
    details_columns = ['created','patient__full_name','operator','total_price','total_discount']
    details_ordering = ['created',]
    verbose_name = u'Касса'
    date_field = 'created'
    form = CashReportForm
    groups = [
        # group 1
        (('payment_type',),{
            'total_count':Count('id'),
            'total':Sum('total_price'),
            'discount':Sum('total_discount')
        },(
            ('get_payment_type_display',1),
            ('total_count',2),
            ('total',1),
            ('discount',1)
        )),
        # group 2
#        (('execution_place__name',),{
#            'total_count':Count('id'),
#            'total_price':Sum('price')
#        },(
#            ('execution_place__name',1),
#            ('total_count',1),
#            ('total_price',1)
#        ))
    ]
    show_details = 'top'
    
    def get_payment_type_display(self, obj):
        types = {}
        for item in PAYMENT_TYPES:
            types[item[0]] = item[1]
        return types[obj['payment_type']]

    
register('payment', PaymentReport)
#register('lab', LabReport)
register('labservice', LabServiceReport)
register('staff_short', StaffShortReport)
register('staff_details', StaffDetailsReport)
register('staff_wide', StaffWideReport)
register('uss_staff_wide', USSWideReport)
register('uss_referral', USSReferralReport)
register('patient', PatientReport)
register('referral', ReferralReport)
register('cash', CashReport)