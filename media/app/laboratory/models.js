Ext.ns('App','App.models');


App.models.LabService = new Ext.data.Record.create([
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
    {name: 'patient_age'},
    {name: 'resource_uri'},
    {name: 'service'},
    {name: 'service_name'},
    {name: 'service_full_name'},
    {name: 'staff'},
    {name: 'staff_name'}
]);


App.models.EquipmentAssay = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'equipment'},
    {name: 'equipment_name'},
    {name: 'service'},
    {name: 'service_name'}
]);

App.models.EquipmentResult = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'order'},
    {name: 'assay'},
    {name: 'result'},
    {name: 'measurement'}
]);

App.models.Equipment = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'name'},
    {name: 'slug'},
    {name: 'address'},
    {name: 'order'},
    {name: 'is_active', type:'bool'}
]);

App.models.EquipmentTask = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'equipment_assay'},
    {name: 'ordered_service'},
    {name: 'equipment_name'},
    {name: 'service_name'},
    {name: 'patient_name'},
    {name: 'order'},
    {name: 'completed', type:'date', format:'c'},
    {name: 'created', type:'date', format:'c'}
]);