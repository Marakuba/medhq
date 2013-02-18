# -*- coding: utf-8 -*-

"""
"""

from elaphe.bwipp import barcode
from StringIO import StringIO
from django.http import HttpResponse


def barcodeimg(request):
    codetype = 'code39'
    codestring = str(request.GET.get('codestring'))
    bc = barcode(codetype,
             codestring=codestring,
             options={
                'height': 0.5,
                'includetext': True,
                'textfont': 'Verdana',
                'textyoffset': -9
            })
    tmp_file = StringIO()
    bc.save(tmp_file, 'PNG')

    return HttpResponse(tmp_file.getvalue(), 'image/png')
