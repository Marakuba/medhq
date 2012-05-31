# -*- coding: utf-8 -*-

"""
"""

from extdirect.django import polling
from direct.providers import polling_provider
from django.conf import settings

@polling(polling_provider)
def net_stat(request):
    return "Ok"


def handler500(request):
    """
    """
    
    from django.template import Context, loader
    from django.http import HttpResponseServerError

    t = loader.get_template('500.html') # You need to create a 500.html template.
    return HttpResponseServerError(t.render(Context({
        'request': request,
        'STATIC_URL' : settings.STATIC_URL
    })))