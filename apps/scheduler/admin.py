
from django.contrib import admin
from scheduler.models import Calendar, Event, Preorder

class PreorderAdmin(admin.TabularInline):
    """
    """
    model = Preorder

class EventAdmin(admin.ModelAdmin):
    """
    """
    list_filter = ('vacant','start',)
    
    exclude = ('ad','loc','url','timeslot','cid','n','parent','rem')
    search_fields = ('staff__staff__last_name',)
    list_display = ('staff','start','end','vacant')
    readonly_fields = ('staff','vacant')
    date_hierarchy = 'start'
    inlines = [PreorderAdmin]
    
    def queryset(self, request):
        qs = super(EventAdmin, self).queryset(request)
        return qs.filter(timeslot=True)


admin.site.register(Event, EventAdmin)
admin.site.register(Calendar)
