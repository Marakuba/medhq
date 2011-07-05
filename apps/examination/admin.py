# -*- coding: utf-8 -*-

from django.contrib import admin

from models import *
from django import forms
from examination.models import CardTemplate, ExaminationCard


admin.site.register(ExaminationCard)
admin.site.register(CardTemplate)
