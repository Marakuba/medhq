# -*- coding: utf-8 -*-

"""
"""

from django.contrib import admin

from numeration.models import BarcodePackage, Barcode, Numerator, NumeratorItem,\
    BarcodePrinter

class BarcodePrinterAdmin(admin.ModelAdmin):
    list_display = ('name','slug','state','address','port')

admin.site.register(Barcode)
admin.site.register(BarcodePackage)
admin.site.register(BarcodePrinter, BarcodePrinterAdmin)
admin.site.register(Numerator)
admin.site.register(NumeratorItem)