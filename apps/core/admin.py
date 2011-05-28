# -*- coding: utf-8 -*-

from django.contrib.admin import ModelAdmin
from django.conf import settings

class OperatorAdmin(ModelAdmin):
    
    def save_model(self, request, obj, form, change):
        if not obj.operator_id:
            obj.operator_id = request.user.pk
        obj.save()    
    

class TabbedAdmin(ModelAdmin):
    
    class Media:
        css = {
            "all": (settings.MEDIA_URL + "jquery/jquery-ui-1.8.custom.css",)
        }
        js = (settings.MEDIA_URL + "jquery/jquery-1.4.2.min.js",
              settings.MEDIA_URL + "jquery/jquery.cookie.js",
              settings.MEDIA_URL + "jquery/jquery.ui.core.js",
              settings.MEDIA_URL + "jquery/jquery.ui.widget.js",
              settings.MEDIA_URL + "jquery/jquery.ui.tabs.js",)

    change_form_template = "admin/tabbed/change_form.html"



class TabbedMedia(ModelAdmin):
    
    class Media:
        css = {
            "all": (settings.MEDIA_URL + "jquery/jquery-ui-1.8.custom.css",)
        }
        js = (settings.MEDIA_URL + "jquery/jquery-1.4.2.min.js",
              settings.MEDIA_URL + "jquery/jquery.cookie.js",
              settings.MEDIA_URL + "jquery/jquery.ui.core.js",
              settings.MEDIA_URL + "jquery/jquery.ui.widget.js",
              settings.MEDIA_URL + "jquery/jquery.ui.tabs.js",)
