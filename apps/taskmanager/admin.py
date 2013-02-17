# -*- coding: utf-8 -*-

from django.contrib import admin
from taskmanager.models import DelayedTask

from lab.utils import router
from taskmanager.tasks import manageable_task


def recreate_task(modeladmin, request, queryset):
    """
    """
    for obj in queryset:
        lab_order = obj.assigned_to
        if lab_order.is_completed:
            try:
                state = lab_order.visit.office.remotestate
                if state.mode == u'a':
                    action_params = {}
                    manageable_task.delay(operator=request.user,
                                          task_type='remote',
                                          action=router,
                                          object=lab_order,
                                          action_params=action_params,
                                          task_params={'countdown': 300})
            except:
                pass

recreate_task.short_description = u"Отослать повторно"


class DelayedTaskAdmin(admin.ModelAdmin):

    def get_info(self, obj):
        o = obj.assigned_to
        if hasattr(o, 'get_info'):
            return o.get_info()
        else:
            return '?'

    actions = [recreate_task]
    date_hierarchy = 'created'
    list_filter = ('status',)
    list_display = ('id', 'get_info', 'created', 'completed', 'attempts', 'next_attempt', 'status')

admin.site.register(DelayedTask, DelayedTaskAdmin)
