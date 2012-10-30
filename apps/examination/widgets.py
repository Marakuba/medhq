# -*- coding: utf-8 -*-

"""
"""
from django.shortcuts import render_to_response
from django.template.context import RequestContext
from scheduler.models import Preorder

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
    required = False
    title_print = True
    title_editable = True
    xtype = None
    tpl = 'print/examination/widget/%s.html'
    
    def __init__(self, request, title, value, printable=True, private=False, title_print=True, **kwargs):
        self.request = request
        self.title = title
        self.value = value
        self.printable = printable
        self.private = private
        self.title_print = title_print
        self.opts = kwargs
        self.template = self.tpl % self.xtype

    def get_ctx(self):
        return {
            'title': self.title,
            'value': self.value,
            'xtype': self.xtype,
            'object': self
        }
    
    def to_html(self):
        ctx = self.get_ctx()
        return render_to_response(self.template, ctx,
                           context_instance=RequestContext(self.request)).content
    
class WidgetManager(object):
    
    def __init__(self, request, data=None, **kwargs):
        self.request = request
        self.widgets = []
        self.opts = kwargs
        if data:
            self.data = data
            self.parse_data()
    
    def parse_data(self):
        for t in self.data:
            self.add_widget(self.request, 
                            t['xtype'], 
                            t['title'], 
                            t['value'], 
                            t['printable'],
                            t['private'],
                            'title_print' in t and t['title_print'] or True,
                            **self.opts)
    
    def add_widget(self, request, xtype, title, value, printable=True, private=False, title_print=True, **kwargs):
        try:
            widget_cls = get_widget(xtype)
            self.widgets.append(widget_cls(request, title, value, printable, private, title_print, **kwargs))
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
    

class TitleWidget(BaseWidget):
    xtype = 'titleticket'
    required = True
    fixed = True
    unique = True


class QuestWidget(BaseWidget):
    xtype = 'questticket'
    

class IcdWidget(BaseWidget):
    xtype = 'icdticket'

    def get_ctx(self):
        return {
            'title':self.title,
            'value':self.value['_rendered'],
            'xtype':self.xtype
        } 
    
    
class AsgmtWidget(BaseWidget):
    xtype = 'asgmtticket'
    unique = True
    
    def to_html(self):
        asgmts = Preorder.objects.filter(card=self.opts['card'].id)
        print len(asgmts)
        ctx = {
            'title':self.title,
            'value':self.value,
            'xtype':self.xtype,
            'asgmts':asgmts
        }
        return render_to_response(self.template, ctx,
                           context_instance=RequestContext(self.request)).content
    


register('textticket',      TextWidget)
register('titleticket',     TitleWidget)
register('questticket',     QuestWidget)
register('icdticket',       IcdWidget)
register('asgmtticket',     AsgmtWidget)
