# -*- coding: utf-8 -*-

from django import forms
from selection.views import selection
from selection.widgets import SelectionWidget

class ModelChoiceField(forms.ModelChoiceField):
    """
    A ModelChoiceField which uses an autocomplete widget, instead of an html
    select tag, to render its choices.
    """
    widget = SelectionWidget

    def __init__(self, ac_name, reverse_label=True, view=selection,
                 widget=None, **kwargs):
        self.ac_name = ac_name
        self.view = view
        self.required = kwargs.get('required',True)
        if widget is None:
            widget = self.widget(ac_name, reverse_label, view, self.required)
        forms.Field.__init__(self, widget=widget, **kwargs)

    def _get_queryset(self):
        return self.view.settings[self.ac_name][0]
    queryset = property(_get_queryset, forms.ModelChoiceField._set_queryset)

    @property
    def to_field_name(self):
        return "pk"#self.view.settings[self.ac_name][3]
