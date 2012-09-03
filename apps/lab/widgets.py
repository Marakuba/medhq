# -*- coding: utf-8 -*-

"""
"""

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
    return zip(_registry.keys(), [cls.verbose_name for cls in _registry.values()] )



class BaseWidget(object):
    
    verbose_name = None
    
    def get_verbose(self):
        return self.verbose_name
    
    def process_results(self, results):
        return results