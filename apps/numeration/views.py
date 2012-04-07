# -*- coding: utf-8 -*-

"""
"""
from django.shortcuts import get_object_or_404
from visit.models import Visit
from django.views.generic.simple import direct_to_template
from numeration.models import BarcodePackage, BarcodePrinter
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
        printer = BarcodePrinter.objects.get(state=request.active_profile.department.state, slug=slug)
        data = {
            'address':printer.address,
            'port':printer.port
        }
        return dict(success=True, data=data)
    except Exception, err:
        logger.error(u"NUMERATION: %s" % err)
        return dict(success=False, data={})
