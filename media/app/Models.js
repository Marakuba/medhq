Ext.ns('App','App.models');

App.models.Template = new Ext.data.Record.create([
    {name: 'name', allowBlank: false},
    {name: 'print_name', allowBlank: true},
    {name: 'print_date', allowBlank: true,  type:'date', format: 'c'},
    {name: 'base_service'},
    {name: 'staff', allowBlank: true},
    {name: 'data', allowBlank: true}
]);

App.models.paymentModel = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'doc_date', allowBlank: true, type:'date', format: 'd.m.Y'}, 
	{name: 'client_account', allowBlank: true}, 
	{name: 'client_name', allowBlank: true}, 
	{name: 'client', allowBlank: true}, 
	{name: 'amount', allowBlank: true},
	{name: 'account_id', allowBlank: true},
	{name: 'income', allowBlank: true},
	{name: 'payment_type', allowBlank: true},
	{name: 'comment', allowBlank: true},
	{name: 'content_type', allowBlank: true},
	{name: 'print_check', allowBlank: true}
]);

App.models.visitModel = new Ext.data.Record.create([
    {name: 'id'},
	{name: 'created', allowBlank: false, type:'date'},
	{name: 'cls', allowBlank: false},
	{name: 'total_price', allowBlank: false},
	{name: 'total_paid', allowBlank: false},
	{name: 'discount', allowBlank: false},
	{name: 'discount_value', allowBlank: true},
	{name: 'barcode_id', allowBlank: true},
	{name: 'office_name', allowBlank: false},
	{name: 'operator_name', allowBlank: false},
	{name: 'patient_name', allowBlank: false},
	{name: 'patient_id', allowBlank: false},
	{name: 'is_billed', allowBlank: false, type:'boolean'},
	{name: 'referral_name', allowBlank: false}
]);

App.models.preorderModel = new Ext.data.Record.create([
    {name: 'id'},
	{name: 'resource_uri'},
	{name: 'patient'},
	{name: 'patient_name'},
	{name: 'timeslot'},
	{name: 'comment'},
	{name: 'visit'},
	{name: 'service'},
	{name: 'base_service'},
	{name: 'service_name'},
	{name: 'price'},
	{name: 'department'},
	{name: 'staff'},
	{name: 'staff_name'},
	{name: 'payment_type'},
	{name: 'execution_place'},
	{name: 'execution_place_name'},
	{name: 'patient_phone'},
	{name: 'start', type: 'date',format:'c'}
]);

App.models.patientModel = new Ext.data.Record.create([
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
	{name: 'discount_name'},
	{name: 'client_item'},
	{name: 'balance'},
	{name: 'initial_account'},
	{name: 'billed_account'},
	{name: 'doc'},
	{name: 'hid_card'}
]);