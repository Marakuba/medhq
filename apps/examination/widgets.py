# -*- coding: utf-8 -*-

"""
"""
from django.shortcuts import render_to_response
from django.template.context import RequestContext
import simplejson

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
    
    def __init__(self, request, title, text, printable=True, private=False, **kwargs):
        self.request = request
        self.title = title
        self.text = text
        self.printable = printable
        self.private = private
        self.opts = kwargs
        self.template = self.tpl % self.xtype
    
    def to_html(self):
        raise NotImplemented()
    
class WidgetManager():
    
    def __init__(self, request, data=None, **kwargs):
        self.request = request
        self.widgets = []
        self.opts = kwargs
        if data:
            self.data = data
            self.parse_data()
    
    def parse_data(self):
        ddata = simplejson.loads(self.data)
        tickets = ddata['tickets']
        for t in tickets:
            self.add_widget(self.request, 
                            t['xtype'], 
                            t['title'], 
                            t['text'], 
                            t['printable'],
                            t['private'])
    
    def add_widget(self, request, xtype, title, text, printable=True, private=False, **kwargs):
        try:
            widget_cls = get_widget(xtype)
            self.widgets.append(widget_cls(request, title, text, printable, private, **kwargs))
        except:
            raise Exception('error with widget "%s"' % xtype)
    
    def get(self, wid):
        if isinstance(wid, basestring):
            self.get_by_xtype(wid)
        elif isinstance(wid, int):
            self.get_by_id(wid)
        else:
            raise NotImplemented()
    
    def get_by_id(self, wid):
        return self.widgets[wid]
    
    def get_by_xtype(self, xtype):
        for widget in self.widgets:
            if widget.xtype==xtype:
                return widget
        return None
    

class TextWidget(BaseWidget):
    xtype = 'textticket'
    
    def to_html(self):
        ctx = {
            'title':self.title,
            'text':self.text,
            'xtype':self.xtype
        }
        render_to_response(self.template, ctx,
                           context_instance=RequestContext(self.request))
        

class TitleWidget(BaseWidget):
    xtype = 'titleticket'
    
    def to_html(self):
        ctx = {
            'title':self.title,
            'text':self.text,
            'xtype':self.xtype
        }
        render_to_response(self.template, ctx,
                           context_instance=RequestContext(self.request))
        

class QuestWidget(BaseWidget):
    xtype = 'questticket'
    
    def to_html(self):
        ctx = {
            'title':self.title,
            'text':self.text,
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
            'text':self.text,
            'xtype':self.xtype
        }
        render_to_response(self.template, ctx,
                           context_instance=RequestContext(self.request))
        


register('textticket', TextWidget)
register('titleticket', TitleWidget)
register('questticket', QuestWidget)
register('mkbticket', MkbWidget)
register('equipmentticket', EquipmentWidget)
