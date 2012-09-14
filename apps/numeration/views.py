# -*- coding: utf-8 -*-

"""
"""
from django.shortcuts import get_object_or_404
from visit.models import Visit
from django.views.generic.simple import direct_to_template
from numeration.models import BarcodePackage, BarcodePrinter, Barcode
import datetime
from django.db.models.aggregates import Sum

import logging
logger = logging.getLogger('general')

def forvisit(request, visit_id):
    """
    """
    visit = get_object_or_404(Visit, id=visit_id)
    bc_count = visit.sampling_set.filter(visit=visit, laboratory__type='b', number__isnull=True).aggregate(sum=Sum('tube__bc_count'))
    count = bc_count['sum']+1
    ec = {
        'barcode':visit.id,
        'count':count
    }
    
    return direct_to_template(request,
                              template='numeration/forvisit.html',
                              extra_context=ec)
    
def package(request, package_id):
    """
    """
    package = get_object_or_404(BarcodePackage, id=package_id)
    barcodes = package.barcode_set.all().order_by('id',)
    
    if not package.print_date:
        package.print_date = datetime.datetime.now()
        package.save()
    
    ec = {
        'barcodes':barcodes
    }
    
    return direct_to_template(request,
                              template='numeration/package.html',
                              extra_context=ec)


def duplicate(request, code, count):
    """
    """
    #package = get_object_or_404(BarcodePackage, id=package_id)
    #barcodes = package.barcode_set.all().order_by('id',)
    
    
    ec = {
        'code':code,
        'count':int(count)
    }
    
    return direct_to_template(request,
                              template='numeration/duplicate.html',
                              extra_context=ec)


from direct.providers import remote_provider
from extdirect.django.decorators import remoting
import simplejson


@remoting(remote_provider, len=1, action='numeration', name='getPrinterBySlug')
def getPrinterBySlug(request):
    data = simplejson.loads(request.raw_post_data)
    slug = data['data'][0]
    try:
        printers = BarcodePrinter.objects.filter(state=request.active_profile.department.state, slug=slug)
        data = {
            'printers':[dict(id=p.id, name=p.name, address=p.address, port=p.port) for p in printers]
        }
        return dict(success=True, data=data)
    except Exception, err:
        if __debug__:
            logger.error(u"NUMERATION: %s" % err)
        return dict(success=False, data={})
    
@remoting(remote_provider, len=1, action='numeration', name='getBarcodePayer')
def getBarcodePayer(request):
    data = simplejson.loads(request.raw_post_data)
    barcode_id = data['data'][0]
    
    try:
        barcode_id = int(barcode_id)
    except:
        return dict(success=False,data=u'Штрих-код введен не числовой')
    try:
        b = Barcode.objects.get(id=barcode_id)
    except:
        return dict(success=False,data=u'Введенный штрих-код не найден')
    if b.status == 1:
        return dict(success=False,data=u'Введенный штрих-код использован')
    if not b.package:
        return dict(success=False,data=u'пакет не указан')
    if not b.package.laboratory:
        return dict(success=False,data=u'плательщик не указан')
    try:
        data = {
                'barcode_id':b.id,
                'payer_id':b.package.laboratory.id
                }
        return dict(success=True, data=data)
    except:
        return dict(success=False,data=u'пакет или плательщик не указаны')