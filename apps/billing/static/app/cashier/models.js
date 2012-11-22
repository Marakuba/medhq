Ext.ns('App.models');

App.models.Debtor = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'first_name', allowBlank: false},
    {name: 'mid_name'},
    {name: 'last_name', allowBlank: false},
    {name: 'gender', allowBlank: false},
    {name: 'mobile_phone'},
    {name: 'home_address_street'},
    {name: 'email'},
    {name: 'birth_day', allowBlank: false, type:'date'},
    {name: 'discount'},
    {name: 'client_item'},
    {name: 'balance'},
    {name: 'initial_account'},
    {name: 'billed_account'},
    {name: 'doc'},
    {name: 'hid_card'}
]);

App.models.Depositor = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'first_name', allowBlank: false},
    {name: 'mid_name'},
    {name: 'last_name', allowBlank: false},
    {name: 'gender', allowBlank: false},
    {name: 'mobile_phone'},
    {name: 'home_address_street'},
    {name: 'email'},
    {name: 'birth_day', allowBlank: false, type:'date'},
    {name: 'discount'},
    {name: 'client_item'},
    {name: 'balance'},
    {name: 'initial_account'},
    {name: 'billed_account'},
    {name: 'doc'},
    {name: 'hid_card'}
]);
