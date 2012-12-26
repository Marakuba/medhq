Ext.ns('App.models');

App.models.Patient = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'first_name', allowBlank: false},
    {name: 'mid_name'},
    {name: 'last_name', allowBlank: false},
    {name: 'gender', allowBlank: false},
    {name: 'lat'},
    {name: 'mobile_phone'},
    {name: 'home_address_street'},
    {name: 'email'},
    {name: 'birth_day', allowBlank: false, type:'date', format: 'd.m.Y'},
    {name: 'discount'},
    {name: 'discount_name'},
    {name: 'ad_source'},
    {name: 'ad_source_name'},
    {name: 'client_item'},
    {name: 'balance'},
    {name: 'initial_account'},
    {name: 'billed_account'},
    {name: 'doc'},
    {name: 'hid_card'},
    {name: 'guardian'},
    {name: 'id_card_type'},
    {name: 'id_card_series'},
    {name: 'id_card_number'},
    {name: 'id_card_issue_date', type:'date', dateFormat:'c'},
    {name: 'id_card_org'},
    {name: 'contract'},
    {name: 'short_name'},
    {name: 'accepted', type:'date', dateFormat:'c'},
    {name: 'assignment_notify'},
    {name: 'lab_notify'},
    {name: 'preorder_notify'}
     
]);

App.models.Contract = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'state'},
    {name: 'resource_uri'},
    {name: 'state_name'},
    {name: 'patient'},
    {name: 'contract_type'},
    {name: 'contract_type_name'},
    {name: 'created', type:'date', format: 'd.m.Y'},
    {name: 'expire', type:'date', format: 'd.m.Y'},
    {name: 'active'},
    {name: 'template'}
]);

App.models.ContractType = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'title'},
    {name: 'template'},
    {name: 'type'},
    {name: 'validity'}
]);