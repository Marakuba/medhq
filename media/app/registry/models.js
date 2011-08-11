Ext.ns('App','App.models');

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