# -*- coding: utf-8 -*-


import django.dispatch

app_load = django.dispatch.Signal(providing_args=["app_label", ])
