# -*- coding: utf-8 -*-

from django.forms import widgets
from django.utils.safestring import mark_safe
from django.core.urlresolvers import reverse
from django.utils.encoding import force_unicode
from django.forms.util import flatatt
from django.template import Context, Template

from selection.views import selection

TEMPLATE = u'''
<div class="choiceHolder">{{ value }}</div>
<a id="{{ name }}_handler" class="iframe awesome choicer" href="{{ url }}">{% if value %}Изменить{% else %}Выбрать{% endif %}</a>
{% if cleanable %}
<a class="awesome red tiny {% if not value %}hid{% endif %}">Очистить</a>
{% endif %}
<input type="hidden" name="{{ name }}" id="id_hidden_{{ name }}" value="{{ hidden_value }}" />
'''

class SelectionWidget(widgets.Widget):

    TEMPLATE = TEMPLATE

    def __init__(self, ac_name, reverse_label=True,
                 view=selection, required=True, attrs=None):
        super(SelectionWidget, self).__init__(attrs)
        self.ac_name = ac_name
        self.reverse_label = reverse_label
        self.view = view
        self.required=required
    
    def render(self, name, value, attrs=None, choices=()):
        url = reverse(self.view, args=[self.ac_name])
        cleanable = not self.required
        if not value:
            value = hidden_value = u''
        elif self.reverse_label:
            hidden_value = force_unicode(value)
            value = self.view.reverse_label(self.ac_name, value)
        else:
            value = hidden_value = force_unicode(value)
        attrs = flatatt(self.build_attrs(attrs))
        c = Context(locals())
        t = Template(self.TEMPLATE)
        return t.render(c)

