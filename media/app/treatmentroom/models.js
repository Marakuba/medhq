Ext.ns('App','App.models');


App.models.ServiceToSend = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'created', type:'date', format:'c'},
    {name: 'service'},
    {name: 'service_name'},
    {name: 'patient_id'},
    {name: 'patient_sync_id'},
    {name: 'patient_name'},
    {name: 'patient_birth_day', type:'date', format:'c'},
]);