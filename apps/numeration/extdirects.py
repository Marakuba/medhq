# -*- coding: utf-8 -*-

"""
"""
from numeration.models import BarcodePrinter, Barcode
from direct.providers import remote_provider
from extdirect.django.decorators import remoting
import simplejson
import re


@remoting(remote_provider, len=1, action='numeration', name='getPrinterBySlug')
def getPrinterBySlug(request):
    data = simplejson.loads(request.raw_post_data)
    slug = data['data'][0]
    try:
        printers = BarcodePrinter.objects.filter(state=request.active_profile.department.state, slug=slug)
        data = {
            'printers': [dict(id=p.id, name=p.name, address=p.address, port=p.port) for p in printers]
        }
        return dict(success=True, data=data)
    except Exception, err:
        return dict(success=False, data={}, message=err.__unicode__())


@remoting(remote_provider, len=1, action='numeration', name='getBarcodePayer')
def getBarcodePayer(request):
    data = simplejson.loads(request.raw_post_data)
    barcode_id = re.sub('\D', '', data['data'][0])

    try:
        barcode_id = int(barcode_id)
    except:
        return dict(success=False, data=u'Штрих-код введен не числовой')
    try:
        b = Barcode.objects.get(id=barcode_id)
    except:
        return dict(success=False, data=u'Введенный штрих-код не найден')
    if b.status == 1:
        return dict(success=False, data=u'Введенный штрих-код использован')
    if not b.package:
        return dict(success=False, data=u'пакет не указан')
    if not b.package.laboratory:
        return dict(success=False, data=u'плательщик не указан')
    try:
        data = {
                'barcode_id': b.id,
                'payer_id': b.package.laboratory.id
                }
        return dict(success=True, data=data)
    except:
        return dict(success=False, data=u'пакет или плательщик не указаны')
