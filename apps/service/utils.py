# -*- coding: utf-8 -*-

import csv

def unicode_csv_reader(unicode_csv_data, **kwargs):
    # csv.py doesn't do Unicode; encode temporarily as UTF-8:
    csv_reader = csv.reader(utf_8_encoder(unicode_csv_data), **kwargs)
    for row in csv_reader:
        # decode UTF-8 back to Unicode, cell by cell:
        yield [unicode(cell, 'utf-8').strip() for cell in row]

def utf_8_encoder(unicode_csv_data):
    for line in unicode_csv_data:
        yield line.encode('utf-8')


def make_analysis(obj, analysises):

    from appserver.apps.lab.models import Analysis, InputMask, Measurement
    
    for analysis in analysises:
        new_analysis, created = Analysis.objects.get_or_create(service=obj, name=unicode(analysis[0],'utf-8'))
        if analysis[1]:
            new_measurement, created = Measurement.objects.get_or_create(name=unicode(analysis[1],'utf-8'))
            new_analysis.measurement = new_measurement 
        if analysis[3]:
            new_input_mask, created = InputMask.objects.get_or_create(value=unicode(analysis[3],'utf-8'))
            new_analysis.input_mask = new_input_mask
        new_analysis.save()
        print u"Добавлен анализ:", new_analysis