# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('scheduler')
class SchedulerApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/scheduler/src/Ext.calendar.js',

        'app/scheduler/src/templates/DayHeaderTemplate.js',
        'app/scheduler/src/templates/DayBodyTemplate.js',
        'app/scheduler/src/templates/DayViewTemplate.js',
        'app/scheduler/src/templates/BoxLayoutTemplate.js',
        'app/scheduler/src/templates/MonthViewTemplate.js',

        'app/scheduler/src/dd/CalendarScrollManager.js',

        'app/scheduler/src/dd/StatusProxy.js',
        'app/scheduler/src/dd/CalendarDD.js',
        'app/scheduler/src/dd/DayViewDD.js',

        'app/scheduler/src/EventRecord.js',
        'app/scheduler/src/views/MonthDayDetailView.js',
        'app/scheduler/src/WeekEventRenderer.js',

        'app/scheduler/src/widgets/CalendarPicker.js',
        'app/scheduler/src/widgets/StaffPicker.js',
        'app/scheduler/src/widgets/StaffGrid.js',
        'app/scheduler/src/views/CalendarView.js',
        'app/scheduler/src/views/DayView.js',
        'app/scheduler/src/views/DayBodyView.js',

        'app/scheduler/src/views/MonthView.js',
        'app/scheduler/src/views/DayHeaderView.js',
        'app/scheduler/src/views/WeekView.js',

        'app/scheduler/src/widgets/DateRangeField.js',
        'app/scheduler/src/widgets/ReminderField.js',

        'app/scheduler/app/timeslot/ServiceGrid.js',

        'app/choices/patient/PatientChoiceGrid.js',
        'app/choices/patient/PatientChoiceWindow.js',
        'app/scheduler/app/timeslot/VacantTimeslotGrid.js',
        'app/scheduler/app/timeslot/PreorderedServiceInlineGrid.js',

        'app/scheduler/src/EventEditForm.js',
        'app/scheduler/src/EventEditWindow.js',
        'app/scheduler/app/timeslot/TimeslotInfoWindow.js',

        'app/scheduler/app/timeslot/TimeslotEditForm.js',
        'app/scheduler/app/timeslot/TimeslotEditWindow.js',
        'app/scheduler/src/CalendarPanel.js',
        'app/scheduler/app/DoctorScheduler.js',
    ]
    css = {
        'all': [
            'app/scheduler/assets/css/calendar.css',
            'app/scheduler/assets/css/examples.css',
            'app/scheduler/assets/css/custom.css',
        ]
    }
    depends_on = ['webapp3', ]


@register('doctorscheduler')
class DoctorSchedulerApp(SchedulerApp):
    pass


@register('preordermanager')
class PreorderManagerApp(BaseWebApp):
    verbose_name = u'Предзаказы'
    cmp_type = 'action'
    js = [
        'extjs/ux/printer/Printer-all.js',
        'app/patient/models.js',
        'app/scheduler/models.js',
        'app/asgmt/AsgmtForm.js',
        'app/asgmt/AsgmtListWindow.js',
        'app/asgmt/AsgmtTab.js',
        'app/asgmt/DeletePromptWindow.js',
        'app/asgmt/PreorderInlineGrid.js',
        'app/patient/AsgmtGrid.js',
        'app/preorder/PreorderGrid.js',
        'app/preorder/PreorderManager.js',
        'app/preorder/utils.js',
    ]
    depends_on = ['service-panel', ]


@register('cardpreordermanager')
class CardPreorderManagerApp(BaseWebApp):
    verbose_name = u'Предзаказы (карта пациента)'
    cmp_type = 'action'
    js = [
        'app/preorder/card/CardPreorderManager.js',
    ]
    depends_on = ['preordermanager', ]
