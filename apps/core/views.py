# -*- coding: utf-8 -*-

"""
"""

from extdirect.django import polling
from direct.providers import polling_provider

@polling(polling_provider)
def net_stat(request):
    return "Ok"