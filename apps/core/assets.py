# -*- coding: utf-8 -*-

from django_assets import Bundle, register
from django.conf import settings 

debug = settings.DEBUG and '-debug' or ''

js_for_all = Bundle(
    'libs/jquery.js',
    'libs/raven.js',
    filters='rjsmin', output='assets/for_all.js',)

js_ext = Bundle(
    'extjs/adapter/ext/ext-base.js',
    'extjs/ext-all'+debug+'.js',
    'extjs/src/locale/ext-lang-ru.js',
    
    filters='rjsmin', output='assets/ext.js',)

js_registry = Bundle(
    'extjs/ux/progresscolumn/ProgressColumn.js',

    'extjs/ux/printer/Printer-all.js',

    'extjs/ux/RowEditor.js',
    'extjs/ux/Spinner.js',
    'extjs/ux/SpinnerField.js',
    'extjs/ux/statusbar/StatusBar.js',
    'extjs/ux/SearchField.js',
    'extjs/ux/CheckColumn.js', 
    'app/ux/InputTextMask.js', 
    
    'extjs/ux/treegrid/TreeGridSorter.js',
    'extjs/ux/treegrid/TreeGridColumnResizer.js',
    'extjs/ux/treegrid/TreeGridNodeUI.js',
    'extjs/ux/treegrid/TreeGridLoader.js',
    'extjs/ux/treegrid/TreeGridColumns.js',
    'extjs/ux/treegrid/TreeGrid.js',

    'app/data/RestStore.js',

    'app/App.js',
    'app/Backend.js',
    'app/form/ClearableComboBox.js',
    'app/form/LazyComboBox.js',

    'app/Models.js',

    'app/registry/EventManager.js',
    
    'app/ux/GSearchField.js',
    
    'app/calendar/EventManager.js',
    'app/calendar/src/Ext.calendar.js',
    
    'app/calendar/src/templates/DayHeaderTemplate.js',
    'app/calendar/src/templates/DayBodyTemplate.js',
    'app/calendar/src/templates/DayViewTemplate.js',
    'app/calendar/src/templates/BoxLayoutTemplate.js',
    'app/calendar/src/templates/MonthViewTemplate.js',
    
    'app/calendar/src/dd/CalendarScrollManager.js',
    'app/calendar/src/dd/StatusProxy.js',
    'app/calendar/src/dd/CalendarDD.js',
    'app/calendar/src/dd/DayViewDD.js',
    
    'app/calendar/src/EventRecord.js',
    'app/calendar/src/views/MonthDayDetailView.js',
    'app/calendar/src/WeekEventRenderer.js',
    'app/calendar/src/widgets/CalendarPicker.js',
    'app/calendar/src/widgets/StaffPicker.js',
    'app/calendar/src/widgets/StaffGrid.js',
    'app/calendar/src/views/CalendarView.js',
    'app/calendar/src/views/DayView.js',
    'app/calendar/src/views/DayBodyView.js',
    'app/calendar/src/views/MonthView.js',
    'app/calendar/src/views/DayHeaderView.js',
    'app/calendar/src/views/WeekView.js',
    
    'app/calendar/src/widgets/DateRangeField.js',
    'app/calendar/src/widgets/ReminderField.js',
    
    'app/calendar/app/timeslot/ServiceGrid.js',
    'app/choices/patient/PatientChoiceGrid.js',
    'app/choices/patient/PatientChoiceWindow.js',
    'app/calendar/app/timeslot/VacantTimeslotGrid.js',
    'app/calendar/app/timeslot/PreorderedServiceInlineGrid.js',
    
    'app/calendar/src/EventEditForm.js',
    'app/calendar/src/EventEditWindow.js',
    'app/calendar/app/timeslot/TimeslotInfoWindow.js',
    'app/calendar/app/timeslot/TimeslotEditForm.js',
    'app/calendar/app/timeslot/TimeslotEditWindow.js',
    'app/calendar/src/CalendarPanel.js',
    'app/calendar/app/DoctorScheduler.js',
    
    'app/orderedservice/ResultWindow.js',
    'app/orderedservice/RemoteOrderGrid.js',
    'app/orderedservice/LocalOrderGrid.js',
    'app/orderedservice/Orders.js',

    'app/invoice/InvoiceItemGrid.js',
    'app/invoice/InvoiceForm.js',
    'app/invoice/InvoiceTab.js',
    'app/invoice/InvoiceGrid.js',

    'app/registry/ReferralGrid.js',
    'app/registry/ReferralWindow.js',


    'app/choices/barcode/BarcodeChoiceGrid.js',
    'app/choices/barcode/BarcodeChoiceWindow.js',
    'app/choices/paymenttype/PaymentTypeChoiceWindow.js',
    
    'app/registry/patient/ManualGrid.js',
    'app/registry/patient/LabGrid.js',
    'app/registry/patient/ExamCardGrid.js',
    'app/registry/patient/AsgmtGrid.js',
    'app/registry/patient/VisitGrid.js',
    'app/registry/patient/ServiceGrid.js',
    'app/registry/patient/RefundGrid.js',
    'app/registry/patient/ContractGrid.js',
    'app/registry/patient/NotifyForm.js',
    'app/registry/patient/IDCardForm.js',
    'app/registry/patient/PatientForm.js',
    'app/registry/patient/PatientWindow.js',
    'app/registry/patient/PatientGrid.js',
    'app/registry/patient/Info.js',
    'app/registry/patient/PatientCard.js',
    'app/registry/patient/QuickForm.js',
    'app/registry/Patients.js',

    'app/helpdesk/issue/IssueForm.js',
    'app/helpdesk/issue/IssueWindow.js',
    'app/helpdesk/issue/IssueGrid.js',

    'app/registry/insurance/PolicyGrid.js',
    'app/registry/insurance/PolicyWindow.js',
    'app/registry/insurance/StateGrid.js',
    'app/registry/insurance/StateWindow.js',
    
    'app/choices/staff/StaffChoiceGrid.js',
    'app/choices/staff/StaffChoiceWindow.js',
    
    'app/registry/preorder/utils.js',
    'app/registry/preorder/PatientPreorderGrid.js',
    'app/registry/preorder/PreorderGrid.js',
    'app/registry/preorder/PreorderManager.js',
    
    'app/registry/visit/VisitServicePanel.js',
    'app/service/ServiceTreeGrid.js',
    'app/registry/visit/StaffGrid.js',
    'app/registry/visit/StaffWindow.js',
    'app/registry/visit/VisitForm.js',
    'app/registry/visit/OrderedServiceInlineGrid.js',
    'app/registry/visit/VisitTab.js',
    
    'app/registry/asgmt/DeletePromptWindow.js',
    'app/registry/asgmt/PreorderInlineGrid.js',
    'app/registry/asgmt/AsgmtListWindow.js',
    'app/registry/asgmt/AsgmtForm.js',
    'app/registry/asgmt/AsgmtTab.js',
    
    'app/registry/barcodepackage/Grid.js',
    'app/registry/barcodepackage/Form.js',
    'app/registry/barcodepackage/DuplicateWindow.js',
    'app/registry/barcodepackage/Window.js',
    
    'app/registry/visit/VisitGrid.js',
    
    'app/registry/Visits.js',
    
    'app/registry/barcode/Grid.js',
    'app/registry/barcode/Window.js',
    'app/registry/Barcodes.js',

    'app/registry/sampling/TubeWindow.js',
    'app/registry/sampling/TubeTree.js',
    'app/registry/sampling/ServiceGrid.js',
    'app/registry/sampling/FreeGrid.js',
    'app/registry/sampling/Editor.js',

    'app/registry/results/Grid.js',
    'app/registry/Results.js',

    'app/registry/Reports.js',
    
    'app/registry/patient/clientaccount/backends.js',
    'app/registry/patient/clientaccount/ClientAccountGrid.js',
    
    'app/registry/patient/billing/payment/PaymentForm.js',
    'app/registry/patient/billing/payment/PaymentGrid.js',
    'app/registry/patient/billing/payment/PaymentWindow.js',
    
    'app/cashier/CashierTab.js',
    'app/cashier/DebtorGrid.js',
    'app/cashier/DepositorGrid.js',

    'app/registry/MainPanel.js',
    'app/registry/CentralPanel.js',
    'app/registry/app.js',


    'resources/js/web-socket-js/swfobject.js',
    'resources/js/web-socket-js/web_socket.js',
    filters='rjsmin', output='assets/registry.js',)

js_oldexam = Bundle(
    'libs/markdown.js',
    'extjs/ux/progresscolumn/ProgressColumn.js',
    'extjs/ux/RowEditor.js',
    'extjs/ux/CheckColumn.js',
    'extjs/ux/Spinner.js',
    'extjs/ux/SpinnerField.js', 

    'extjs/ux/PortalColumn.js', 
    'extjs/ux/Portal.js', 

    'app/ux/InputTextMask.js', 
    
    'app/ux/InputTextMask.js',
    'extjs/ux/progresscolumn/ProgressColumn.js',
    
    'app/ux/GSearchField.js',
    'app/ux/StatusBar.js',
    'app/App.js',
    'app/Backend.js',
    'app/form/ClearableComboBox.js',
    'app/form/LazyComboBox.js',

    'app/data/RestStore.js',

    'app/examination/backends.js',
    'app/Models.js',
    
    'app/examination/examorder/Grid.js',
    'app/examination/examorder/OldGrid.js',

    'app/dict/mkb/MKBTree.js',
    'app/dict/mkb/MKBWindow.js',
    
    'app/examination/EventManager.js',
    'app/examination/OldCentralPanel.js',
    'app/examination/MainPanel.js',
    'app/examination/OldApp.js',
    
    'app/ux/remotetree/js/Ext.ux.form.ThemeCombo.js',
    'app/ux/remotetree/js/Ext.ux.HttpProvider.js',
    'app/ux/remotetree/js/Ext.ux.IconMenu.js',
    'app/ux/remotetree/js/Ext.ux.menu.IconMenu.js',
    'app/ux/remotetree/js/Ext.ux.ThemeCombo.js',
    'app/ux/remotetree/js/Ext.ux.Toast.js',
    'app/ux/remotetree/js/Ext.ux.tree.RemoteTreePanel.js',
    'app/ux/remotetree/js/Ext.ux.tree.TreeFilterX.js',
    'app/ux/remotetree/js/WebPage.js',
    
    'app/ux/DropDownList.js',
    
    'extjs/ux/treegrid/TreeGridSorter.js',
    'extjs/ux/treegrid/TreeGridColumnResizer.js',
    'extjs/ux/treegrid/TreeGridNodeUI.js',
    'extjs/ux/treegrid/TreeGridLoader.js',
    'extjs/ux/treegrid/TreeGridColumns.js',
    'extjs/ux/treegrid/TreeGrid.js',
    
    'app/examination/templates/TmpGrid.js',
    'app/examination/cards/CardGrid.js',
    
    'app/registry/ServicePanel.js',
    'app/service/ServiceTreeGrid.js',
    'app/dict/glossary/EditNodeWindow.js',
    'app/dict/glossary/XGlossaryTree.js',
    'app/dict/glossary/GlossaryTree.js',
    'app/dict/glossary/GlossaryPanel.js',
    'app/examination/editor/GlossaryTree.js',
    'app/examination/editor/EquipmentTab.js',
    'app/examination/editor/GeneralTab.js',
    'app/examination/editor/TicketTab.js',
    'app/examination/editor/TemplateBody.js',
    'app/examination/editor/StartPanel.js',
    'app/examination/editor/card.js',
    
    'app/examination/patient/PatientHistoryTreeGrid.js',
    'app/examination/patient/PatientHistoryPanel.js',
    'app/examination/patient/PatientHistory.js',
    
    'app/registry/asgmt/PreorderInlineGrid.js',
    'app/registry/asgmt/AsgmtForm.js',
    'app/registry/asgmt/AsgmtTab.js',
    'app/registry/patient/AsgmtGrid.js',
    
    'app/examination/cards/CardApp.js',
    'app/examination/templates/TplApp.js',
    
    'app/examination/conclusion/ConclApp.js',
    
    'app/examination/archive/ArchiveApp.js',
    
    'app/examination/trash/TrashApp.js',
    
    'app/examination/templates/CardTemplateWindow.js',
    'app/examination/templates/CardTemplateForm.js',
    'app/examination/templates/TemplateGrid.js',
    'app/examination/templates/TemplateGlobalGrid.js',
    'app/examination/templates/TemplateBackend.js',
    'app/examination/templates/TemplatesWindow.js',
    'app/examination/templates/GroupGrid.js',
    
    
    'app/examination/patient/PatientGrid.js',
    'app/examination/patient/PatientGridPanel.js',

    'app/calendar/EventManager.js',
    'app/calendar/src/Ext.calendar.js',

    
    'app/calendar/src/templates/DayHeaderTemplate.js',
    'app/calendar/src/templates/DayBodyTemplate.js',
    'app/calendar/src/templates/DayViewTemplate.js',
    'app/calendar/src/templates/BoxLayoutTemplate.js',
    'app/calendar/src/templates/MonthViewTemplate.js',
    
    'app/calendar/src/dd/CalendarScrollManager.js',

    'app/calendar/src/dd/StatusProxy.js',
    'app/calendar/src/dd/CalendarDD.js',
    'app/calendar/src/dd/DayViewDD.js',
    
    'app/calendar/src/EventRecord.js',
    'app/calendar/src/views/MonthDayDetailView.js',
    'app/calendar/src/WeekEventRenderer.js',

    'app/calendar/src/widgets/CalendarPicker.js',
    'app/calendar/src/widgets/StaffPicker.js',
    'app/calendar/src/widgets/StaffGrid.js',
    'app/calendar/src/views/CalendarView.js',
    'app/calendar/src/views/DayView.js',
    'app/calendar/src/views/DayBodyView.js',

    'app/calendar/src/views/MonthView.js',
    'app/calendar/src/views/DayHeaderView.js',
    'app/calendar/src/views/WeekView.js',
    
    'app/calendar/src/widgets/DateRangeField.js',
    'app/calendar/src/widgets/ReminderField.js',
    
    'app/calendar/app/timeslot/ServiceGrid.js',

    'app/calendar/app/timeslot/PatientGrid.js',
    'app/calendar/app/timeslot/VacantTimeslotGrid.js',
    'app/calendar/app/timeslot/PreorderedServiceInlineGrid.js',
    
    'app/calendar/src/EventEditForm.js',
    'app/calendar/src/EventEditWindow.js',
    'app/calendar/app/timeslot/TimeslotInfoWindow.js',

    'app/calendar/app/timeslot/TimeslotEditForm.js',
    'app/calendar/app/timeslot/TimeslotEditWindow.js',
    'app/calendar/src/CalendarPanel.js',
    'app/calendar/app/DoctorScheduler.js',
    filters='rjsmin', output='assets/old_exam.js',)
    
js_calendar = Bundle(
    'extjs/ux/Spinner.js',
    'extjs/ux/SearchField.js',
    'extjs/ux/SpinnerField.js',
    'extjs/ux/statusbar/StatusBar.js',
    'app/ux/InputTextMask.js',
    'app/ux/GSearchField.js',

    'extjs/ux/RowEditor.js',
    'extjs/ux/CheckColumn.js', 
    
    'app/ux/GSearchField.js',
    'app/App.js',
    'app/Backend.js',
    'app/form/ClearableComboBox.js',
    'app/form/LazyComboBox.js',
    'app/calendar/EventManager.js',

    'app/calendar/src/Ext.calendar.js',
    
    'app/calendar/src/templates/DayHeaderTemplate.js',
    'app/calendar/src/templates/DayBodyTemplate.js',
    'app/calendar/src/templates/DayViewTemplate.js',
    'app/calendar/src/templates/BoxLayoutTemplate.js',
    'app/calendar/src/templates/MonthViewTemplate.js',
    
    'app/calendar/src/dd/CalendarScrollManager.js',
    'app/calendar/src/dd/StatusProxy.js',
    'app/calendar/src/dd/CalendarDD.js',
    'app/calendar/src/dd/DayViewDD.js',
    
    'app/calendar/src/EventRecord.js',
    'app/calendar/src/views/MonthDayDetailView.js',
    'app/calendar/src/widgets/CalendarPicker.js',
    'app/calendar/src/widgets/StaffPicker.js',
    'app/calendar/src/widgets/StaffGrid.js',
    'app/calendar/src/WeekEventRenderer.js',
    'app/calendar/src/views/CalendarView.js',
    'app/calendar/src/views/MonthView.js',
    'app/calendar/src/views/DayHeaderView.js',
    'app/calendar/src/views/DayBodyView.js',
    'app/calendar/src/views/DayView.js',
    'app/calendar/src/views/WeekView.js',
    
    'app/calendar/src/widgets/DateRangeField.js',
    'app/calendar/src/widgets/ReminderField.js',
    
    'app/data/RestStore.js',
    'app/registry/patient/clientaccount/backends.js',
    'app/registry/patient/clientaccount/ClientAccountGrid.js',
    'app/registry/insurance/PolicyGrid.js',
    'app/calendar/app/timeslot/ServiceGrid.js',
    'app/choices/patient/PatientChoiceGrid.js',
    'app/choices/patient/PatientChoiceWindow.js',
    'app/registry/patient/PatientWindow.js',
    'app/registry/patient/PatientForm.js',
    
    'app/registry/visit/VisitServicePanel.js',
    'app/calendar/app/timeslot/PreorderedServiceInlineGrid.js',
    
    'app/calendar/src/EventEditForm.js',
    'app/calendar/src/EventEditWindow.js',
    'app/calendar/app/timeslot/TimeslotInfoWindow.js',
    'app/calendar/app/timeslot/TimeslotEditForm.js',
    'app/calendar/app/timeslot/TimeslotEditWindow.js',
    'app/calendar/src/CalendarPanel.js',
    'app/calendar/app/DoctorScheduler.js',
    
    'app/calendar/CentralPanel.js',
    'app/calendar/MainPanel.js',
    'app/calendar/app.js',
    filters='rjsmin', output='assets/calendar.js',)

js_examination = Bundle(
    'libs/tiny_mce/tiny_mce.js',
    'libs/Ext.ux.TinyMCE.min.js',
    'extjs/ux/printer/Printer-all.js',
    
    
#    'libs/markdown.js',
    'extjs/ux/progresscolumn/ProgressColumn.js',
    'extjs/ux/RowEditor.js',
    'extjs/ux/CheckColumn.js',
    'extjs/ux/Spinner.js',
    'extjs/ux/SpinnerField.js', 

    'extjs/ux/PortalColumn.js', 
    'extjs/ux/Portal.js', 

    'app/ux/InputTextMask.js', 
    
    'app/ux/InputTextMask.js',
    'extjs/ux/progresscolumn/ProgressColumn.js',
    
    'app/ux/GSearchField.js',
    'app/ux/StatusBar.js',
    'app/App.js',
    'app/Backend.js',
    'app/form/ClearableComboBox.js',
    'app/form/LazyComboBox.js',
    'app/registry/preorder/utils.js',

    'app/data/RestStore.js',

    'app/examination/backends.js',
    'app/Models.js',
    
    'app/examination/startpanel/StartView.js',
    'app/examination/startpanel/StartPanel.js',
    'app/examination/startpanel/CardStartPanel.js',
    'app/examination/startpanel/TemplateStartPanel.js',
    
    'app/examination/questionnaire/QuestEditor.js',
    'app/examination/questionnaire/QuestPreviewPanel.js',
    'app/examination/questionnaire/QuestApp.js',
    
    'app/examination/examorder/Grid.js',
    'app/examination/examorder/OldGrid.js',

    'app/dict/mkb/MKBTree.js',
    'app/dict/mkb/MKBWindow.js',
    
    'app/examination/medstandarts/MedStandartGrid.js',
    'app/examination/medstandarts/MedStandartServiceGrid.js',
    'app/examination/medstandarts/MedStandartChoiceForm.js',
    'app/examination/medstandarts/MedStandartChoiceWindow.js',
    
    'app/examination/EventManager.js',
    'app/examination/CentralPanel.js',
    'app/examination/MainPanel.js',
    'app/examination/app.js',
    
    'app/ux/remotetree/js/Ext.ux.form.ThemeCombo.js',
    'app/ux/remotetree/js/Ext.ux.HttpProvider.js',
    'app/ux/remotetree/js/Ext.ux.IconMenu.js',
    'app/ux/remotetree/js/Ext.ux.menu.IconMenu.js',
    'app/ux/remotetree/js/Ext.ux.ThemeCombo.js',
    'app/ux/remotetree/js/Ext.ux.Toast.js',
    'app/ux/remotetree/js/Ext.ux.tree.RemoteTreePanel.js',
    'app/ux/remotetree/js/Ext.ux.tree.TreeFilterX.js',
    'app/ux/remotetree/js/WebPage.js',
    
    'app/ux/DropDownList.js',
    
    'extjs/ux/treegrid/TreeGridSorter.js',
    'extjs/ux/treegrid/TreeGridColumnResizer.js',
    'extjs/ux/treegrid/TreeGridNodeUI.js',
    'extjs/ux/treegrid/TreeGridLoader.js',
    'extjs/ux/treegrid/TreeGridColumns.js',
    'extjs/ux/treegrid/TreeGrid.js',
    
    'app/examination/templates/TmpGrid.js',
    'app/examination/cards/CardGrid.js',
    
    'app/registry/ServicePanel.js',
    'app/service/ServiceTreeGrid.js',
    'app/dict/glossary/EditNodeWindow.js',
    'app/dict/glossary/XGlossaryTree.js',
    'app/dict/glossary/GlossaryTree.js',
    'app/dict/glossary/GlossaryPanel.js',
    'app/examination/editor/GlossaryTree.js',
    'app/examination/editor/EquipmentTab.js',
    'app/examination/editor/GeneralTab.js',
    'app/examination/tickets/Ticket.js',
    'app/examination/tickets/text/TextTicket.js',
    'app/examination/tickets/TicketTab.js',
    'app/examination/editor/SectionPanel.js',
    'app/examination/editor/DataTab.js',
    'app/examination/editor/TemplateBody.js',
    
    'app/dict/glossary/GlossaryEditor.js',
    
    'app/examination/patient/PatientHistoryTreeGrid.js',
    'app/examination/patient/PatientHistoryPanel.js',
    'app/examination/patient/PatientHistory.js',
    
    'app/registry/asgmt/DeletePromptWindow.js',
    'app/registry/asgmt/AsgmtListWindow.js',
    'app/registry/asgmt/PreorderInlineGrid.js',
    'app/registry/asgmt/AsgmtForm.js',
    'app/registry/asgmt/AsgmtTab.js',
    'app/registry/patient/AsgmtGrid.js',
    'app/registry/preorder/PreorderGrid.js',
    'app/registry/preorder/PreorderManager.js',
    
    'app/registry/patient/ExamCardGrid.js',
    'app/examination/gendoc/PatientCard.js',
    'app/examination/gendoc/GeneralDoctorPanel.js',
    
    'app/examination/cards/CardApp.js',
    'app/examination/templates/TplApp.js',
    
    'app/examination/conclusion/ConclApp.js',
    
    'app/examination/archive/ArchiveApp.js',
    
    'app/examination/trash/TrashApp.js',
    
    'app/examination/patient/PatientGrid.js',
    'app/examination/patient/PatientGridPanel.js',

    'app/calendar/EventManager.js',
    'app/calendar/src/Ext.calendar.js',
    
    'app/calendar/src/templates/DayHeaderTemplate.js',
    'app/calendar/src/templates/DayBodyTemplate.js',
    'app/calendar/src/templates/DayViewTemplate.js',
    'app/calendar/src/templates/BoxLayoutTemplate.js',
    'app/calendar/src/templates/MonthViewTemplate.js',
    
    'app/calendar/src/dd/CalendarScrollManager.js',

    'app/calendar/src/dd/StatusProxy.js',
    'app/calendar/src/dd/CalendarDD.js',
    'app/calendar/src/dd/DayViewDD.js',
    
    'app/calendar/src/EventRecord.js',
    'app/calendar/src/views/MonthDayDetailView.js',
    'app/calendar/src/WeekEventRenderer.js',

    'app/calendar/src/widgets/CalendarPicker.js',
    'app/calendar/src/widgets/StaffPicker.js',
    'app/calendar/src/widgets/StaffGrid.js',
    'app/calendar/src/views/CalendarView.js',
    'app/calendar/src/views/DayView.js',
    'app/calendar/src/views/DayBodyView.js',

    'app/calendar/src/views/MonthView.js',
    'app/calendar/src/views/DayHeaderView.js',
    'app/calendar/src/views/WeekView.js',
    
    'app/calendar/src/widgets/DateRangeField.js',
    'app/calendar/src/widgets/ReminderField.js',
    
    'app/calendar/app/timeslot/ServiceGrid.js',

    'app/choices/patient/PatientChoiceGrid.js',
    'app/choices/patient/PatientChoiceWindow.js',
    'app/calendar/app/timeslot/VacantTimeslotGrid.js',
    'app/calendar/app/timeslot/PreorderedServiceInlineGrid.js',
    
    'app/calendar/src/EventEditForm.js',
    'app/calendar/src/EventEditWindow.js',
    'app/calendar/app/timeslot/TimeslotInfoWindow.js',

    'app/calendar/app/timeslot/TimeslotEditForm.js',
    'app/calendar/app/timeslot/TimeslotEditWindow.js',
    'app/calendar/src/CalendarPanel.js',
    'app/calendar/app/DoctorScheduler.js',
    filters='rjsmin', output='assets/examination.js',)

js_helpdesk = Bundle(
    'extjs/ux/RowEditor.js',
    'extjs/ux/CheckColumn.js', 
    
    'app/ux/GSearchField.js',
    'app/App.js',
    'app/Backend.js',
    'app/form/ClearableComboBox.js',
    'app/form/LazyComboBox.js',

    'app/data/RestStore.js',

    'app/helpdesk/EventManager.js',
    'app/helpdesk/CentralPanel.js',
    'app/helpdesk/MainPanel.js',
    'app/helpdesk/app.js',
    
    
    'app/helpdesk/issue/IssueGrid.js',
    'app/helpdesk/issue/IssueForm.js',
    'app/helpdesk/issue/IssueWindow.js',
    filters='rjsmin', output='assets/helpdesk.js',)

js_laboratory = Bundle(
    'libs/growl/js/ext/ux/Growl.js',

    'extjs/ux/RowEditor.js',
    'extjs/ux/CheckColumn.js', 

    'app/ux/InputTextMask.js', 
    
    'app/data/RestStore.js',

    'app/ux/GSearchField.js',
    'app/App.js',
    'app/Backend.js',
    'app/form/ClearableComboBox.js',
    'app/form/LazyComboBox.js',

    'app/laboratory/backends.js',
    'app/Models.js',

    'app/laboratory/scanner/ScannerWindow.js',

    'app/laboratory/search/SearchWindow.js',

    'app/laboratory/register/RegisterWindow.js',
    'app/laboratory/register/RegisterApp.js',

    'app/laboratory/result/widget/BasePlain.js',
    'app/laboratory/result/widget/BaseColumn.js',

    'app/laboratory/result/loader/ResultLoaderApp.js',

    'app/laboratory/fields/InputList.js',

    'app/laboratory/manual/cards/BaseCard.js',
    'app/laboratory/manual/cards/sperm.js',
    'app/laboratory/manual/cards/ugsmear.js',

    'app/laboratory/manual/ManualGrid.js',
    
    'app/laboratory/investigation/InvestigationGrid.js',

    'app/laboratory/laborder/LabBoard.js',
    'app/laboratory/laborder/LabOrderGrid.js',
    'app/laboratory/laborder/LabServiceGrid.js',
    'app/laboratory/laborder/LabTestGrid.js',

    'app/laboratory/equipment/EquipmentGrid.js',
    'app/laboratory/equipment/EquipmentTaskGrid.js',
    'app/laboratory/equipment/EquipmentResultGrid.js',
    'app/laboratory/equipment/EquipmentAssayGrid.js',

    'app/laboratory/result/CommentWindow.js',
    'app/laboratory/result/ResultGrid.js',
    'app/laboratory/result/ResultCard.js',

    'app/laboratory/EventManager.js',
    'app/laboratory/CentralPanel.js',
    'app/laboratory/MainPanel.js',
    'app/laboratory/app.js',
    
    'app/registry/barcodepackage/DuplicateWindow.js',

    'resources/js/web-socket-js/swfobject.js',
    'resources/js/web-socket-js/web_socket.js',
    filters='rjsmin', output='assets/laboratory.js',)

js_reporting = Bundle(
    'extjs/ux/statusbar/StatusBar.js',
    'app/App.js',
    'app/Backend.js',
    'app/Models.js',
    'app/data/RestStore.js',
    'app/form/ClearableComboBox.js',
    'app/form/LazyComboBox.js',
    'app/ux/GSearchField.js',
    'app/ux/InputTextMask.js',
    
    'app/registry/patient/clientaccount/backends.js',
    'app/registry/patient/clientaccount/ClientAccountGrid.js',
    'app/registry/patient/IDCardForm.js',
    'app/registry/patient/ContractGrid.js',
    'app/registry/insurance/PolicyGrid.js',
    'app/registry/patient/PatientForm.js',
    'app/registry/patient/PatientWindow.js',
    'app/choices/staff/StaffChoiceGrid.js',
    'app/choices/staff/StaffChoiceWindow.js',
    
    'app/choices/referral/ReferralChoiceGrid.js',
    'app/choices/referral/ReferralChoiceWindow.js',
    
    'app/choices/state/StateChoiceGrid.js',
    'app/choices/state/StateChoiceWindow.js',
    
    'app/choices/patient/PatientChoiceGrid.js',
    'app/choices/patient/PatientChoiceWindow.js',
    
    'app/choices/servicegroup/ServiceGroupChoiceGrid.js',
    'app/choices/servicegroup/ServiceGroupChoiceWindow.js',
    
    'app/reporting/reports/PrintPanel.js',
    'app/reporting/reports/FilterPanel.js',
    'app/reporting/editor/field.js',
    'app/reporting/editor/ReportEditor.js',
    'app/reporting/reports/ReportPanel.js',
    
    'app/dict/reports/ReportTree.js',
    'app/reporting/reports/ReportApp.js',
    
    'app/reporting/EventManager.js',
    'app/reporting/CentralPanel.js',
    'app/reporting/MainPanel.js',
    'app/reporting/app.js',
    filters='rjsmin', output='assets/reporting.js',)

js_barcoding = Bundle(
    'resources/js/web-socket-js/swfobject.js',
    'resources/js/web-socket-js/web_socket.js',
    'extjs/ux/statusbar/StatusBar.js',
    'app/App.js',
    'app/Backend.js',
    'app/Models.js',
    'app/data/RestStore.js',
    'app/form/ClearableComboBox.js',
    'app/form/LazyComboBox.js',
    'app/ux/GSearchField.js',
    'app/ux/InputTextMask.js',
    
    'app/registry/barcode/Grid.js',
    'app/registry/barcode/Window.js',
    
    'app/registry/barcodepackage/Grid.js',
    'app/registry/barcodepackage/Window.js',
    'app/registry/barcodepackage/PrintWindow.js',
    'app/registry/barcodepackage/Form.js',
    'app/registry/barcodepackage/DuplicateWindow.js',
    
    'app/barcoding/EventManager.js',
    'app/barcoding/CentralPanel.js',
    'app/barcoding/MainPanel.js',
    'app/barcoding/app.js',
    filters='rjsmin', output='assets/barcoding.js',)

js_service = Bundle(
    'app/service/ServicePanel.js',
    'app/service/MainPanel.js',
    'app/service/app.js',

    filters='rjsmin', output='assets/service.js',)

js_treatmentroom = Bundle(
    'libs/growl/js/ext/ux/Growl.js',
    'extjs/ux/RowEditor.js',
    'extjs/ux/CheckColumn.js', 
    'app/data/RestStore.js',
    'app/ux/GSearchField.js',
    'app/App.js',
    'app/form/ClearableComboBox.js',
    'app/form/LazyComboBox.js',
    'app/Models.js',
    'app/treatmentroom/tests/LabTestGrid.js',
    'app/treatmentroom/EventManager.js',
    'app/treatmentroom/CentralPanel.js',
    'app/treatmentroom/MainPanel.js',
    'app/treatmentroom/app.js',
    filters='rjsmin', output='assets/treatmentroom.js',)
                     
register('js_registry', js_registry)
register('js_for_all', js_for_all)
register('js_ext', js_ext)
register('js_examination', js_examination)
register('js_oldexam', js_oldexam)
register('js_calendar', js_calendar)
register('js_helpdesk', js_helpdesk)
register('js_laboratory', js_laboratory)
register('js_reporting', js_reporting)
register('js_barcoding', js_barcoding)
register('js_service', js_service)
register('js_treatmentroom', js_treatmentroom)
##################################################

css_ext = Bundle(
    'extjs/resources/css/ext-all.css',
    'extjs/ux/css/RowEditor.css',
    'extjs/ux/css/Spinner.css',
    'extjs/ux/treegrid/treegrid.css',
    'extjs/ux/statusbar/css/statusbar.css',
    'extjs/ux/progresscolumn/ProgressColumn.css',
    filters=('cssrewrite','cssmin'), output='assets/ext.css',)

css_auth = Bundle(
    'extjs/resources/css/ext-all.css',
    'resources/css/app.css',
    'resources/css/silk.css',
    filters=('cssrewrite','cssmin'), output='assets/auth.css',)

css_calendar = Bundle(
    'extjs/resources/css/ext-all.css',
    'extjs/ux/css/RowEditor.css',
    'extjs/ux/css/Spinner.css',
    'extjs/ux/treegrid/treegrid.css',
    'extjs/ux/statusbar/css/statusbar.css',

    'resources/css/app.css',
    'app/calendar/resources/css/calendar.css',
    'app/calendar/resources/css/examples.css',
    
    'resources/css/silk.css',
    'extjs/ux/css/Spinner.css',
    'extjs/ux/css/RowEditor.css',
    filters=('cssrewrite','cssmin'), output='assets/calendar.css',)

css_examination = Bundle(
    'extjs/resources/css/ext-all.css',

    'resources/css/app.css',
    'app/calendar/resources/css/calendar.css',
    'app/calendar/resources/css/examples.css',
    
    'resources/css/silk.css',

    'extjs/ux/css/Spinner.css',
    'extjs/ux/css/RowEditor.css',
    'extjs/ux/treegrid/treegrid.css',
    'extjs/ux/progresscolumn/ProgressColumn.css',
    
    'app/ux/remotetree/css/empty.css',
    'app/ux/remotetree/css/icons.css',
    'app/ux/remotetree/css/remotetree.css',
    'app/ux/remotetree/css/webpage.css',
    filters=('cssrewrite','cssmin'), output='assets/examination.css',)

css_helpdesk = Bundle(
    'extjs/resources/css/ext-all.css',

    'resources/css/app.css',
    
    'resources/css/silk.css',
    'extjs/ux/css/Spinner.css',
    'extjs/ux/css/RowEditor.css',
    filters=('cssrewrite','cssmin'), output='assets/helpdesk.css',)

css_laboratory = Bundle(
    'extjs/resources/css/ext-all.css',

    'resources/css/app.css',
    
    'resources/css/silk.css',
    'extjs/ux/css/Spinner.css',
    'extjs/ux/css/RowEditor.css',
    
    
    'libs/growl/css/ext/ux/Growl.css',
    filters=('cssrewrite','cssmin'), output='assets/laboratory.css',)

css_oldexam = Bundle(
    'extjs/resources/css/ext-all.css',

    'resources/css/app.css',
    'app/calendar/resources/css/calendar.css',
    'app/calendar/resources/css/examples.css',

    'resources/css/silk.css',

    'extjs/ux/css/Spinner.css',
    'extjs/ux/css/RowEditor.css',
    'extjs/ux/treegrid/treegrid.css',
    'extjs/ux/progresscolumn/ProgressColumn.css',
    
    'app/ux/remotetree/css/empty.css',
    'app/ux/remotetree/css/icons.css',
    'app/ux/remotetree/css/remotetree.css',
    'app/ux/remotetree/css/webpage.css',
    filters=('cssrewrite','cssmin'), output='assets/oldexam.css',)

css_registry = Bundle(
    'resources/css/app.css',
    'app/calendar/resources/css/calendar.css',
    'app/calendar/resources/css/examples.css',
    'resources/css/silk.css',
    'extjs/ux/css/Spinner.css',
    'extjs/ux/css/RowEditor.css',
    filters=('cssrewrite','cssmin'), output='assets/registry.css',)

css_reporting = Bundle(
    'extjs/resources/css/ext-all.css',
    
    'resources/css/app.css',
    
    'resources/css/silk.css',
    'extjs/ux/css/Spinner.css',
    'extjs/ux/css/RowEditor.css',
    filters=('cssrewrite','cssmin'), output='assets/reporting.css',)

css_barcoding = Bundle(
    'extjs/resources/css/ext-all.css',
    
    'resources/css/app.css',
    
    'resources/css/silk.css',
    'extjs/ux/css/Spinner.css',
    'extjs/ux/css/RowEditor.css',
    filters=('cssrewrite','cssmin'), output='assets/barcoding.css',)

css_service = Bundle(
    'extjs/resources/css/ext-all.css',
    
    'resources/css/app.css',
    
    'resources/css/silk.css',
    filters=('cssrewrite','cssmin'), output='assets/service.css',)

css_testing = Bundle(
    'extjs/resources/css/ext-all.css',
    
    'resources/css/app.css',
    
    'resources/css/silk.css',
    'extjs/ux/css/Spinner.css',
    'extjs/ux/css/RowEditor.css',
    filters=('cssrewrite','cssmin'), output='assets/testing.css',)

css_treatmentroom = Bundle(
    'extjs/resources/css/ext-all.css',
    
    'resources/css/app.css',
    
    'resources/css/silk.css',
    'extjs/ux/css/Spinner.css',
    'extjs/ux/css/RowEditor.css',
    
    'libs/growl/css/ext/ux/Growl.css',
    filters=('cssrewrite','cssmin'), output='assets/treatmentroom.css',)



register('css_registry', css_registry)
register('css_ext', css_ext)
register('css_examination', css_examination)
register('css_oldexam', css_oldexam)
register('css_auth', css_auth)
register('css_calendar', css_calendar)
register('css_helpdesk', css_helpdesk)
register('css_laboratory', css_laboratory)
register('css_reporting', css_reporting)
register('css_barcoding', css_reporting)
register('css_service', css_service)
register('css_testing', css_testing)
register('css_treatmentroom', css_treatmentroom)
