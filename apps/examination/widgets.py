# -*- coding: utf-8 -*-

"""
"""
from django.shortcuts import render_to_response
from django.template.context import RequestContext

_registry = {}

def register(slug, widget):
    _registry[slug] = widget

def get_widget(slug):
    try:
        return _registry[slug]
    except KeyError:
        raise Exception("No such widget '%s'" % slug)

def all_widgets():
    return _registry.items()

def widget_choices():
    return zip(_registry.keys(), [cls.xtype for cls in _registry.values()] )


class BaseWidget(object):
    
    fixed = False
    print_title = True
    xtype = None
    tpl = 'print/examination/widget/%s.html'
    
    def __init__(self, request, title, data, **kwargs):
        self.request = request
        self.title = title
        self.data = data
        self.opts = kwargs
        self.template = self.tpl % self.xtype
    
    def to_html(self):
        raise NotImplemented()
    

class TextWidget(BaseWidget):
    xtype = 'textticket'
    
    def to_html(self):
        ctx = {
            'title':self.title,
            'data':self.data,
            'xtype':self.xtype
        }
        render_to_response(self.template, ctx,
                           context_instance=RequestContext(self.request))
        

class TitleWidget(BaseWidget):
    xtype = 'titleticket'
    
    def to_html(self):
        ctx = {
            'title':self.title,
            'data':self.data,
            'xtype':self.xtype
        }
        render_to_response(self.template, ctx,
                           context_instance=RequestContext(self.request))
        

class QuestWidget(BaseWidget):
    xtype = 'questticket'
    
    def to_html(self):
        ctx = {
            'title':self.title,
            'data':self.data,
            'xtype':self.xtype
        }
        render_to_response(self.template, ctx,
                           context_instance=RequestContext(self.request))
        

class MkbWidget(BaseWidget):
    xtype = 'mkbticket'
    
    def to_html(self):
        ctx = {
            'title':self.title,
            'data':self.data,
            'xtype':self.xtype
        }
        render_to_response(self.template, ctx,
                           context_instance=RequestContext(self.request))
        

class EquipmentWidget(BaseWidget):
    xtype = 'equipmentticket'
    
    def to_html(self):
        ctx = {
            'title':self.title,
            'data':self.data,
            'xtype':self.xtype
        }
        render_to_response(self.template, ctx,
                           context_instance=RequestContext(self.request))
        
