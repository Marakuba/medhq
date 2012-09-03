# -*- coding: utf-8 -*-


def convert_data(obj,type):
    pass

def insertToOther(ticket):
    if not 'other' in sections:
        FieldSet.objects.create(name='other',order=1000,title=u'Дополнительно')
        sections.append('other')
    fields[7]['tickets'].append(ticket)

def model_to_dict(obj,type):
    