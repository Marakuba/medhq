# -*- coding: utf-8 -*-

"""
"""

from extdirect.django import ExtRemotingProvider, ExtPollingProvider


class PollingProvider(ExtPollingProvider):

    def __init__(self, url, event, interval=3000, func=None, login_required=False, permission=None, id=None):
        super(ExtPollingProvider, self).__init__(url, self.type, id)

        self.func = func
        self.event = event
        self.interval = interval

        self.login_required = login_required
        self.permission = permission

    @property
    def _config(self):
        config = {
            'url': self.url,
            'type': self.type,
            'interval': self.interval
        }
        if self.id:
            config['id'] = self.id

        return config

remote_provider = ExtRemotingProvider(namespace='App.direct', url='/direct/router/')
polling_provider = PollingProvider(event='netstatus', url='/direct/polling/', id='netstatus', interval=10000)
