Ext.ns('App.models');

App.models.LabOrder = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'created', type:'date',format:'c'},
    {name: 'visit_created', type:'date',format:'c'},
    {name: 'executed', type:'date',format:'c'},
    {name: 'visit'},
    {name: 'visit_is_cito', type:'boolean'},
    {name: 'barcode'},
    {name: 'laboratory'},
    {name: 'laboratory_name'},
    {name: 'staff'},
    {name: 'staff_name'},
    {name: 'patient_name'},
    {name: 'patient_age'},
    {name: 'lat'},
    {name: 'info'},
    {name: 'office_name'},
    {name: 'operator_name'},
    {name: 'is_male', type:'bool'},
    {name: 'is_completed', type:'bool'},
    {name: 'is_manual', type:'bool'},
    {name: 'manual_service'},
    {name: 'comment'},
    {name: 'widget'},
    {name: 'print_date', type:'date',format:'c'},
    {name: 'printed_by_name'},
    {name: 'payer_name'}
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
    {name: 'created', type:'date',format:'c'},
    {name: 'equipment_name'},
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
    {name: 'status'},
    {name: 'completed', type:'date', format:'c'},
    {name: 'created', type:'date', format:'c'}
]);
