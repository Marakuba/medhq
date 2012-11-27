Ext.ns('App.models');

App.models.Invoice = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'created', type:'date',format:'c'},
    {name: 'state'},
    {name: 'state_name'},
    {name: 'office'},
    {name: 'office_name'},
    {name: 'operator_name'},
    {name: 'comment'}
]);

