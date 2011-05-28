# -*- coding: utf-8 -*-

from django.contrib import admin
from models import State, Department
from django import forms
from state.models import STATE_TYPES

class DepartmentAdmin(admin.ModelAdmin):

    pass

class StateAdminForm(forms.ModelForm):
    """
    """
    #type = forms.CharField(widget=forms.HiddenInput())
    
    class Meta:
        model = State
        exclude = ('website','email')

class StateAdmin(admin.ModelAdmin):
    """
    """
    
    add_form = StateAdminForm
    
    def get_form(self, request, obj=None, **kwargs):
        """
        Use special form during user creation
        """
        defaults = {}
        if obj is None:
            defaults.update({
                'form': self.add_form,
                #'fields': admin.util.flatten_fieldsets(self.add_fieldsets),
            })
        defaults.update(kwargs)
        return super(StateAdmin, self).get_form(request, obj, **defaults)
    
admin.site.register(State, StateAdmin)
admin.site.register(Department, DepartmentAdmin)