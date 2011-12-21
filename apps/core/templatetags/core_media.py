# -*- coding: utf-8 -*-

from django.template.defaulttags import register
from django import forms
from django.conf import settings

CSS_TPL = "<link href=\"%s\" type=\"text/css\" media=\"%s\" rel=\"stylesheet\" />"
JS_TPL = "<script type=\"text/javascript\" src=\"%s\"></script>"

@register.simple_tag
def load_core_media():
    try:
        media = settings.CORE_MEDIA
        STATIC_URL = settings.STATIC_URL
        output = []
        
        css = media.get('css', None)
        if css:
            for k,v in css.iteritems():
                for url in v:
                    path = STATIC_URL + url
                    output.append(CSS_TPL % (path, k))
        
        js = media.get('js', None)
        if js:
            for url in js:
                output.append(JS_TPL % url)
        
        if len(output):
            return "\n".join(output)
    except:
        pass
    
    return ""