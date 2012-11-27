Ext.ns('App.models');

App.models.Visit = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'created', type:'date', dateFormat:'c'},
    {name: 'cls', allowBlank: false},
    {name: 'comment'},
    {name: 'contract'},
    {name: 'total_price'},
    {name: 'total_paid'},
    {name: 'total_sum'},
    {name: 'total_discount'},
    {name: 'discount'},
    {name: 'discount_value'},
    {name: 'barcode_id'},
    {name: 'barcode'},
    {name: 'office_name'},
    {name: 'operator_name'},
    {name: 'payment_type'},
    {name: 'patient', allowBlank: false},
    {name: 'patient_name'},
    {name: 'patient_id'},
    {name: 'is_billed', type:'boolean'},
    {name: 'insurance_policy'},
    {name: 'referral'},
    {name: 'referral_name'},
    {name: '_cache'},
    {name: 'source_lab'},
    {name: 'payer'},
    {name: 'payer_name'},
    {name: 'pregnancy_week'},
    {name: 'menses_day'},
    {name: 'menopause'},
    {name: 'diagnosis'}
]);

App.models.Barcode = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'status'},
    {name: 'package'},
    {name: 'duplicates'}
]);
