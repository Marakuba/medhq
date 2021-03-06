Ext.ns('App.models');

App.models.AccountingContract = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'created', type:'date', dateFormat:'c'},
    {name: 'number'},
    {name: 'on_date', type:'date', dateFormat:'c'},
    {name: 'branch'},
    {name: 'branch_name'},
    {name: 'state'},
    {name: 'state_name'},
    {name: 'modified', type:'date', dateFormat:'c'}
]);

App.models.AccountingInvoice = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'created', type:'date', dateFormat:'c'},
    {name: 'contract'},
    {name: 'number'},
    {name: 'state_name'},
    {name: 'on_date', type:'date', dateFormat:'c'},
    {name: 'total_price'},
    {name: 'modified', type:'date', dateFormat:'c'}
]);

App.models.AccountingInvoiceItem = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'created', type:'date', dateFormat:'c'},
    {name: 'counter'},
    {name: 'invoice'},
    {name: 'patient'},
    {name: 'patient_name'},
    {name: 'service'},
    {name: 'service_name'},
    {name: 'execution_place'},
    {name: 'price'},
    {name: 'count'},
    {name: 'total_price'},
    {name: 'preorder'},
    {name: 'modified', type:'date', dateFormat:'c'}
]);

App.models.State = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'name'},
    {name: 'print_name'},
    {name: 'official_title'},
    {name: 'type'},
    {name: 'remotestate'}
]);

App.models.MedState = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'name'},
    {name: 'print_name'}
]);
