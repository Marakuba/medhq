from django.contrib import admin

from schedule.models import Calendar, Event, CalendarRelation, Rule

def get_calendar_url(obj):
    return '<a href="%s">%s</a>' % (obj.get_absolute_url(),obj.name)

get_calendar_url.allow_tags=True

class CalendarAdminOptions(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ['name']
    list_display = ('__unicode__',get_calendar_url)


admin.site.register(Calendar, CalendarAdminOptions)
admin.site.register([Rule, Event, CalendarRelation])
