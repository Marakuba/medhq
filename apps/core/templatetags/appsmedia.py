# -*- coding: utf-8 -*-

from django.template.defaulttags import register

@register.simple_tag
def tabbed_fieldsets_js(path='/'):
    return """

<script type="text/javascript">
    $(function() {
        $("#tabs").tabs({cookie: { expires: 30}});
    });
</script>"""