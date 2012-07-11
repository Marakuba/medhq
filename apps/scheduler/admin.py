
from django.contrib import admin
from scheduler.models import Calendar, Event, Preorder
from medhq.apps.scheduler.models import RejectionCause

class PreorderInlineAdmin(admin.TabularInline):
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
    inlines = [PreorderInlineAdmin]
    
    def queryset(self, request):
        qs = super(EventAdmin, self).queryset(request)
        return qs.filter(timeslot=True)

class PreorderAdmin(admin.ModelAdmin):
    """
    """
    search_fields = ('patient__last_name','patient__first_name')
    list_display = ('patient','service','price','created','modified')
    exclude = ('timeslot','visit','card')

admin.site.register(Preorder, PreorderAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(Calendar)
admin.site.register(RejectionCause)
