<<<<<<< Updated upstream
from django.contrib.admin import ModelAdmin
from scheduler.models import Event, Calendar
from core.admin import TabbedAdmin
from django.contrib import admin

class EventAdmin(TabbedAdmin):
    """
    """
    
class CalendarAdmin(TabbedAdmin):
    """
    """
    
admin.site.register(Event, EventAdmin)
admin.site.register(Calendar, CalendarAdmin)
=======
from django.contrib import admin
from scheduler.models import Calendar, Event


admin.site.register(Event)
admin.site.register(Calendar)
>>>>>>> Stashed changes
