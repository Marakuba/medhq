# -*- coding: utf-8 -*-

from django.forms import widgets
from django.utils.safestring import mark_safe
from django.core.urlresolvers import reverse
from django.utils.encoding import force_unicode
from django.forms.util import flatatt

from autocomplete.views import autocomplete

AC_TEMPLATE = u'''
<div>
  <input type="hidden" name="%(name)s" id="id_hidden_%(name)s" value="%(hidden_value)s" />
      <input type="text" id="id_%(name)s" value="%(value)s" %(attrs)s />
      <a id="ac_clear" href="#" title="Очистить поле"><img src="/media/resources/images/silk/delete.png"></a>
      <a id="ac_add" class="iframe" href="/patient/patient/add/?_popup=1" title="Добавить нового пациента"><img src="/media/resources/images/silk/add.png"></a>
  <p class="ac_help"></p>
  <script type="text/javascript">var %(var_name)s = new autocomplete("%(name)s", "%(url)s", %(force_selection)s);</script>
</div>
'''

class AutoCompleteWidget(widgets.Widget):

    AC_TEMPLATE = AC_TEMPLATE

    class Media:
        css = {'all': ('resources/js/jui/themes/base/jquery.ui.core.css',
                       'resources/js/jui/themes/base/jquery.ui.tabs.css',
                       'resources/js/jui/themes/base/jquery.ui.autocomplete.css',
                       'resources/js/jui/themes/base/jquery.ui.theme.css',
                       )}
        js = ('resources/js/jui/ui/jquery.ui.core.js',
              'resources/js/jui/ui/jquery.ui.widget.js',
              'resources/js/jui/ui/jquery.ui.tabs.js',
              'resources/js/jui/ui/jquery.ui.position.js',
              'resources/js/jui/ui/jquery.ui.autocomplete.js',
              'resources/js/jquery_autocomplete.js',
              "jquery/jquery.cookie.js",
              )


    def __init__(self, ac_name, force_selection=True, reverse_label=True,
                 view=autocomplete, ac_url=None, attrs=None):
        attrs = attrs or {}
        if 'size' not in attrs:
            attrs['size']=50
        super(AutoCompleteWidget, self).__init__(attrs)
        self.ac_name = ac_name
        self.force_selection = bool(force_selection)
        self.reverse_label = reverse_label
        self.view = view
        self.ac_url = ac_url
    
    def render(self, name, value, attrs=None):
        var_name = 'ac_%s' % name.replace('-', '_')
        url = self.ac_url or reverse(self.view, args=[self.ac_name])
        force_selection = ('false', 'true')[self.force_selection]
        if not value:
            value = hidden_value = u''
        elif self.reverse_label:
            hidden_value = force_unicode(value)
            value = self.view.reverse_label(self.ac_name, value)
        else:
            value = hidden_value = force_unicode(value)
        attrs = flatatt(self.build_attrs(attrs))
        return mark_safe(self.AC_TEMPLATE % locals())

