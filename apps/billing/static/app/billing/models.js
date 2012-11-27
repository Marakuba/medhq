Ext.ns('App.models');

App.models.Payment = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'doc_date', allowBlank: true, type:'date', format: 'd.m.Y'},
    {name: 'client_account', allowBlank: true},
    {name: 'client_name', allowBlank: true},
    {name: 'client', allowBlank: true},
    {name: 'amount', allowBlank: true},
    {name: 'account_id', allowBlank: true},
    {name: 'direction', allowBlank: false},
    {name: 'payment_type', allowBlank: true},
    {name: 'comment', allowBlank: true},
    {name: 'content_type', allowBlank: true},
    {name: 'print_check', allowBlank: true}
]);
