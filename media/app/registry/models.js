Ext.ns('App','App.models');

App.models.LabService = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'created', type:'date',format:'c'},
    {name: 'executed', type:'date',format:'c'},
    {name: 'print_date', type:'date',format:'c'},
    {name: 'created_date', convert:function(v,record){ return Ext.util.Format.date(record.created,'d.m.Y H:m'); } },
    {name: 'barcode'},
    {name: 'key'},
    {name: 'laboratory'},
    {name: 'execution_place'},
    {name: 'lab_group'},
    {name: 'modified'},
    {name: 'order'},
    {name: 'operator_name'},
    {name: 'patient'},
    {name: 'patient_name'},
    {name: 'patient_age'},
    {name: 'resource_uri'},
    {name: 'service'},
    {name: 'service_name'},
    {name: 'service_full_name'},
    {name: 'service_code'},
    {name: 'staff'},
    {name: 'staff_name'}
]);

App.models.Refund = new Ext.data.Record.create([
	{name: 'id'},
    {name: 'created', type:'date',format:'c', allowBlank: true},
    {name: 'cls', allowBlank: false},
    {name: 'patient', allowBlank: false},
    {name: 'patient_id', allowBlank: true},
    {name: 'referral', allowBlank: true},
    {name: 'source_lab', allowBlank: true},
    {name: 'discount_value', allowBlank: true},
    {name: 'total_price', allowBlank: true},
    {name: 'total_paid', allowBlank: true},
    {name: 'office_name', allowBlank: true},
    {name: 'operator_name', allowBlank: true},
    {name: 'patient_name', allowBlank: true},
    {name: 'is_billed', allowBlank: true, type:'boolean'},
    {name: 'referral_name', allowBlank: true}
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
	{name: 'ptype_name'},
	{name: 'execution_place'},
	{name: 'execution_place_name'},
	{name: 'patient_phone'},
	{name: 'promotion'},
	{name: 'promotion_name'},
	{name: 'promo_discount'},
	{name: 'count'},
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
	{name: 'ad_source'},
	{name: 'ad_source_name'},
	{name: 'client_item'},
	{name: 'balance'},
	{name: 'initial_account'},
	{name: 'billed_account'},
	{name: 'doc'},
	{name: 'hid_card'}
]);

App.models.Patient = App.models.patientModel // patientModel will deprecate