# -*- coding: utf-8 -*-


from direct.providers import remote_provider
from extdirect.django.decorators import remoting


@remoting(remote_provider, len=1, action='bonus', name='processCalculation')
def process_calculation(request):
    """
    """

    return {
    }
