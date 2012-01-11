# -*- coding: utf-8 -*-

"""
"""

from extdirect.django import ExtRemotingProvider, ExtPollingProvider
from extdirect.django.decorators import remoting
import simplejson
from django.http import HttpResponse

remote_provider = ExtRemotingProvider(namespace='App.direct', url='/direct/router/')
