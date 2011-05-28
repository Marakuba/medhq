# -*- coding: utf-8 -*-

"""
"""

from django.contrib import admin

from numeration.models import BarcodePackage, Barcode, Numerator, NumeratorItem


admin.site.register(Barcode)
admin.site.register(BarcodePackage)
admin.site.register(Numerator)
admin.site.register(NumeratorItem)