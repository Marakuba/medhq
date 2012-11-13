Ext.ns('App.models');

App.models.ExamService = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'created', type:'date',format:'c'},
    {name: 'executed', type:'date',format:'c'},
    {name: 'printed', type:'date',format:'c'},
    {name: 'created_date', convert:function(v,record){ return Ext.util.Format.date(record.created,'d.m.Y H:m'); } },
    {name: 'barcode'},
    {name: 'key'},
    {name: 'laboratory'},
    {name: 'execution_place'},
    {name: 'lab_group'},
    {name: 'modified'},
    {name: 'order'},
    {name: 'patient'},
    {name: 'patient_full'},
    {name: 'patient_name'},
    {name: 'patient_age'},
    {name: 'resource_uri'},
    {name: 'service'},
    {name: 'service_name'},
    {name: 'service_full_name'},
    {name: 'staff'},
    {name: 'staff_name'}
]);

App.models.Questionnaire = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'name'},
    {name: 'staff'},
    {name: 'base_service'},
    {name: 'code'}
]);

App.models.FieldSet = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'name'},
    {name: 'order'},
    {name: 'title'},
    {name: 'active'}
]);

App.models.SubSection = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'section'},
    {name: 'section_name'},
    {name: 'title'}
]);

App.models.ExamService = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'created', type:'date',format:'c'},
    {name: 'executed', type:'date',format:'c'},
    {name: 'printed', type:'date',format:'c'},
    {name: 'created_date', convert:function(v,record){ return Ext.util.Format.date(record.created,'d.m.Y H:m'); } },
    {name: 'barcode'},
    {name: 'key'},
    {name: 'laboratory'},
    {name: 'execution_place'},
    {name: 'lab_group'},
    {name: 'modified'},
    {name: 'order'},
    {name: 'patient'},
    {name: 'patient_full'},
    {name: 'patient_name'},
    {name: 'patient_age'},
    {name: 'resource_uri'},
    {name: 'service'},
    {name: 'service_name'},
    {name: 'service_full_name'},
    {name: 'staff'},
    {name: 'staff_name'}
]);

App.models.Dicom = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'examination_card'},
    {name: 'dicom_file'},
    {name: 'photo'},
    {name: 'thumb'}
]);

App.models.Template = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'name'},
    {name: 'created'},
    {name: 'modified'},
    {name: 'resource_uri'},
    {name: 'print_name'},
    {name: 'print_date'},
    {name: 'base_service'},
    {name: 'staff'},
    {name: 'data'},
    {name: 'equipment'},
    {name: 'area'},
    {name: 'scan_mode'},
    {name: 'thickness'},
    {name: 'width'},
    {name: 'contrast_enhancement'},
    {name: 'deleted'}
]);
    
App.models.Card = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'created'},
    {name: 'modified'},
    {name: 'resource_uri'},
    {name: 'name'},
    {name: 'print_name'},
    {name: 'print_date'},
    {name: 'patient_id'},
    {name: 'patient_name'},
    {name: 'ordered_service'},
    {name: 'staff_name'},
    {name: 'data'},
    {name: 'questionnaire'},
    {name: 'equipment'},
    {name: 'area'},
    {name: 'scan_mode'},
    {name: 'thickness'},
    {name: 'width'},
    {name: 'contrast_enhancement'},
    {name: 'assistant'},
    {name: 'assistant_name'},
    {name: 'mkb_diag'},
    {name: 'executed'},
    {name: 'deleted'}
]);

