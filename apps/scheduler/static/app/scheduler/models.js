Ext.ns('App.models');

App.models.Preorder = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'patient'},
    {name: 'patient_name'},
    {name: 'timeslot'},
    {name: 'comment', allowBlank: true},
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
    {name: 'completed_count'},
    {name: 'operator_name'},
    {name: 'expiration', type: 'date', dateFormat:'c'},
    {name: 'price'},
    {name: 'card'},
    {name: 'branches'},
    {name: 'start', type: 'date', dateFormat:'c'},
    {name: 'deleted'},
    {name: 'rejection_cause'},
    {name: 'referral'},
    {name: 'referral_name'},
    {name: 'confirmed'}
]);
