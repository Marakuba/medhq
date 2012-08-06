
from django.contrib import admin
from scheduler.models import Calendar, Event, Preorder
from staff.models import Position
from scheduler.models import RejectionCause

class PreorderInlineAdmin(admin.TabularInline):
    """
    """
    model = Preorder

class EventAdmin(admin.ModelAdmin):
    """
    """
    list_filter = ('status','staff','timeslot')
    
    exclude = ('ad','loc','url','n','parent','rem')
    search_fields = ('staff__staff__last_name',)
    list_display = ('staff_verbose','start','end','status')
    readonly_fields = ('staff','cid','timeslot',)
    date_hierarchy = 'start'
#    inlines = [PreorderInlineAdmin]

    def staff_verbose(self, obj):
        try:
            p = Position.objects.get(id=obj.cid)
            return p.staff.short_name() 
        except:
            return "<<EVENT>>"
    
    def queryset(self, request):
        qs = super(EventAdmin, self).queryset(request)
        return qs.filter(timeslot=True)

class PreorderAdmin(admin.ModelAdmin):
    """
    """
    search_fields = ('patient__last_name','patient__first_name')
    list_display = ('patient','service','price','created','modified')
    exclude = ('timeslot','card')
    readolny_fields = ('visit',)

admin.site.register(Preorder, PreorderAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(Calendar)
admin.site.register(RejectionCause)
