# -*- coding: utf-8 -*-

from django.contrib import admin
from .models import Viewport, ViewportApp
from .base import all_webapps_choices
from django import forms


class ViewportAppForm(forms.ModelForm):

    xtype = forms.ChoiceField(label="XType", choices=(),
                                       widget=forms.Select(attrs={}))

    def __init__(self, *args, **kwargs):
        super(ViewportAppForm, self).__init__(*args, **kwargs)
        choices = all_webapps_choices()
        self.fields['xtype'].choices = choices

    class Meta:
        model = ViewportApp


class ViewportAddInlineAdmin(admin.StackedInline):

    model = ViewportApp
    form = ViewportAppForm
    extra = 0
    filter_horizontal = ('users', 'groups')


class ViewportAdmin(admin.ModelAdmin):

    list_display = ('name', 'slug')
    inlines = [ViewportAddInlineAdmin]
    filter_horizontal = ('users', 'groups')


admin.site.register(Viewport, ViewportAdmin)
