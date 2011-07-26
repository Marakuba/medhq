
from django.contrib import admin
from scheduler.models import Calendar, Event


admin.site.register(Event)
admin.site.register(Calendar)
