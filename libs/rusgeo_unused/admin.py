from django.contrib import admin

from models import AdrType, Region, District, City

class AdrTypeAdmin(admin.ModelAdmin):
    list_display = ('name','shortcut','level')
    ordering = ('name',)

class RegionAdmin(admin.ModelAdmin):
    list_display = ('name','code')
    ordering = ('code',)
    search_fields = ['^name',]
    
class DistrictAdmin(admin.ModelAdmin):
    list_display = ('name','code')
    ordering = ('code',)
    search_fields = ['^name',]
    
class CityAdmin(admin.ModelAdmin):
    list_display = ('name','code','region','district')
    exclude = ('district',)
    list_filter = ('adrtype',)
    ordering = ('code',)
    search_fields = ['^name',]
    

admin.site.register(AdrType, AdrTypeAdmin)
admin.site.register(Region, RegionAdmin)
admin.site.register(District, DistrictAdmin)
admin.site.register(City, CityAdmin)