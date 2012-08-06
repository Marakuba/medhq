# -*- coding: utf-8 -*-

from django.contrib import admin
from medhq.apps.medstandart.models import StandartItem, Standart, AgeCategory,\
    NosologicalForm, Phase, Stage, Complications, Term

class StandartItemInlineAdmin(admin.TabularInline):
    model = StandartItem


class StandartAdmin(admin.ModelAdmin):

    inlines = [StandartItemInlineAdmin]

admin.site.register(Standart, StandartAdmin)
admin.site.register(AgeCategory)
admin.site.register(NosologicalForm)
admin.site.register(Phase)
admin.site.register(Stage)
admin.site.register(Complications)
admin.site.register(Term)
admin.site.register(StandartItem)
