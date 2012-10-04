Ext.ns('App','App.models');

App.models.Questionnaire = new Ext.data.Record.create([
    {name: 'id'},
	{name: 'resource_uri'},
	{name: 'name'},
	{name: 'staff'},
	{name: 'base_service'},
	{name: 'code'}
]);

App.models.barcodeModel = new Ext.data.Record.create([
    {name: 'id'},
	{name: 'resource_uri'},
	{name: 'status'},
	{name: 'package'},
	{name: 'duplicates'}
]);

App.models.contractModel = new Ext.data.Record.create([
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

App.models.contractTypeModel = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'title'},
    {name: 'template'},
    {name: 'type'},
    {name: 'validity'}
]);

App.models.paymentModel = new Ext.data.Record.create([
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

App.models.debtorModel = new Ext.data.Record.create([
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

App.models.depositorModel = new Ext.data.Record.create([
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

App.models.visitModel = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
	{name: 'created', type:'date'},
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
	{name: 'completed_count'},
	{name: 'operator_name'},
	{name: 'expiration', type: 'date',format:'c'},
	{name: 'price'},
	{name: 'card'},
	{name: 'branches'},
	{name: 'start', type: 'date',format:'c'},
	{name: 'deleted'},
	{name: 'rejection_cause'},
	{name: 'referral'},
	{name: 'referral_name'},
	{name: 'confirmed'}
]);

App.models.patientModel = new Ext.data.Record.create([
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
	{name: 'id_card_issue_date', type:'date'},
	{name: 'id_card_org'},
	{name: 'contract'},
	{name: 'short_name'},
	{name: 'accepted', type:'date'},
	{name: 'assignment_notify'},
	{name: 'lab_notify'},
	{name: 'preorder_notify'}
	 
]);

App.models.FieldSet = new Ext.data.Record.create([
   	{name: 'id'},
	{name: 'resource_uri'},
	{name: 'name'},
	{name: 'order'},
	{name: 'title'},
	{name: 'active'}
]);

App.models.SubSection = new Ext.data.Record.create([
   	{name: 'id'},
	{name: 'resource_uri'},
	{name: 'section'},
	{name: 'section_name'},
	{name: 'title'}
]);

App.models.ExamService = new Ext.data.Record.create([
    {name: 'id'},
	{name: 'resource_uri'},
    {name: 'created', type:'date',format:'c'},
    {name: 'executed', type:'date',format:'c'},
    {name: 'printed', type:'date',format:'c'},
    {name: 'created_date', convert:function(v,record){ return Ext.util.Format.date(record.created,'d.m.Y H:m'); } },
    {name: 'barcode'},
    {name: 'key'},
    {name: 'laboratory'},
    {name: 'execution_place'},
    {name: 'lab_group'},
    {name: 'modified'},
    {name: 'order'},
    {name: 'patient'},
    {name: 'patient_full'},
    {name: 'patient_name'},
    {name: 'patient_age'},
    {name: 'resource_uri'},
    {name: 'service'},
    {name: 'service_name'},
    {name: 'service_full_name'},
    {name: 'staff'},
    {name: 'staff_name'}
]);

App.models.tmpModel = new Ext.data.Record.create([
	{name: 'id'},
	{name: 'resource_uri'},
	{name: 'staff', allowBlank: false},
	{name: 'staff_name', allowBlank: true},
	{name: 'complaints', allowBlank: true},
	{name: 'anamnesis', allowBlank: true},
	{name: 'ekg', allowBlank: true},
	{name: 'name', allowBlank: false},
	{name: 'print_name', allowBlank: true},
	{name: 'objective_data', allowBlank: true},
	{name: 'psycho_status', allowBlank: true},
	{name: 'gen_diag', allowBlank: true},
	{name: 'mbk_diag', allowBlank: true},
	{name: 'complication', allowBlank: true},
	{name: 'concomitant_diag', allowBlank: true},
	{name: 'clinical_diag', allowBlank: true},
	{name: 'treatment', allowBlank: true},
	{name: 'referral', allowBlank: true},
	{name: 'conclusion', allowBlank: true},
	{name: 'group', allowBlank: true},
	{name: 'group_name', allowBlank: true},
	{name: 'equipment', allowBlank: true},
	{name: 'equipment_name', allowBlank: true},
	{name: 'area', allowBlank: true},
	{name: 'scan_mode', allowBlank: true},
	{name: 'thickness', allowBlank: true},
	{name: 'width', allowBlank: true},
	{name: 'contrast_enhancement', allowBlank: true}
]);
		
App.models.examModel = new Ext.data.Record.create([
	{name: 'id'},
	{name: 'resource_uri'},
	{name: 'created', type:'date',format:'c'},
	{name: 'modified', type:'date',format:'c'},
	{name: 'name',allowBlank: true},
	{name: 'print_name',allowBlank: true},
	{name: 'ordered_service',allowBlank: true},
	{name: 'print_date', allowBlank: true},
	{name: 'objective_data', allowBlank: true},
	{name: 'psycho_status', allowBlank: true},
	{name: 'gen_diag', allowBlank: true},
	{name: 'complication', allowBlank: true},
	{name: 'concomitant_diag', allowBlank: true},
	{name: 'clinical_diag', allowBlank: true},
	{name: 'treatment', allowBlank: true},
	{name: 'referral', allowBlank: true},
	{name: 'disease', allowBlank: true},
	{name: 'complaints', allowBlank: true},
	{name: 'history', allowBlank: true},
	{name: 'anamnesis', allowBlank: true},
	{name: 'mbk_diag', allowBlank: true},
	{name: 'view', allowBlank: true},
	{name: 'conclusion', allowBlank: true},
	{name: 'group', allowBlank: true},
	{name: 'staff_id', allowBlank: true},
	{name: 'equipment', allowBlank: true},
	{name: 'equipment_name', allowBlank: true},
	{name: 'area', allowBlank: true},
	{name: 'scan_mode', allowBlank: true},
	{name: 'thickness', allowBlank: true},
	{name: 'width', allowBlank: true},
	{name: 'contrast_enhancement', allowBlank: true},
	{name: 'comment'},
	{name: 'assistant'},
	{name: 'assistant_name'}
]);

App.models.Dicom = new Ext.data.Record.create([
   	{name: 'id'},
	{name: 'resource_uri'},
	{name: 'examination_card'},
	{name: 'dicom_file'},
	{name: 'photo'},
	{name: 'thumb'}
]);

App.models.Template = new Ext.data.Record.create([
   	{name: 'id'},
   	{name: 'created'},
   	{name: 'modified'},
	{name: 'resource_uri'},
	{name: 'print_name'},
	{name: 'print_date'},
	{name: 'base_service'},
	{name: 'staff'},
	{name: 'data'},
	{name: 'equipment'},
	{name: 'area'},
	{name: 'scan_mode'},
	{name: 'thickness'},
	{name: 'width'},
	{name: 'contrast_enhancement'},
	{name: 'deleted'}
]);
	
App.models.Card = new Ext.data.Record.create([
   	{name: 'id'},
   	{name: 'created'},
   	{name: 'modified'},
	{name: 'resource_uri'},
	{name: 'print_name'},
	{name: 'print_date'},
	{name: 'patient_id'},
	{name: 'patient_name'},
	{name: 'ordered_service'},
	{name: 'data'},
	{name: 'questionnaire'},
	{name: 'equipment'},
	{name: 'area'},
	{name: 'scan_mode'},
	{name: 'thickness'},
	{name: 'width'},
	{name: 'contrast_enhancement'},
	{name: 'assistant'},
	{name: 'assistant_name'},
	{name: 'mkb_diag'},
	{name: 'executed'},
	{name: 'deleted'}
]);

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
    {name: 'office_name'},
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

App.models.StaffModel = new Ext.data.Record.create([
	{name: 'id'},
	{name: 'resource_uri'},
	{name: 'name'},
	{name: 'referral'},
	{name: 'referral_type'}
]);

App.models.ReferralModel = new Ext.data.Record.create([
	{name: 'id'},
	{name: 'resource_uri'},
	{name: 'name'},
	{name: 'agent'},
	{name: 'referral_type'},
	{name: 'referral_type_name'}
])

App.models.LabOrder = new Ext.data.Record.create([
	{name: 'id'},
	{name: 'created', type:'date',format:'c'},
	{name: 'visit_created', type:'date',format:'c'},
	{name: 'executed', type:'date',format:'c'},
	{name: 'visit'},
	{name: 'visit_is_cito', type:'boolean'},
	{name: 'barcode'},
	{name: 'laboratory'},
	{name: 'laboratory_name'},
	{name: 'staff'},
	{name: 'staff_name'},
	{name: 'patient_name'},
	{name: 'patient_age'},
	{name: 'lat'},
	{name: 'info'},
	{name: 'office_name'},
	{name: 'operator_name'},
	{name: 'is_male', type:'bool'},
	{name: 'is_completed', type:'bool'},
	{name: 'is_manual', type:'bool'},
	{name: 'manual_service'},
	{name: 'comment'},
	{name: 'widget'},
	{name: 'print_date', type:'date',format:'c'},
	{name: 'printed_by_name'},
    {name: 'payer_name'}
]);

App.models.EquipmentAssay = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'equipment'},
    {name: 'equipment_name'},
    {name: 'service'},
    {name: 'service_name'}
]);

App.models.EquipmentResult = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
	{name: 'created', type:'date',format:'c'},
    {name: 'equipment_name'},
    {name: 'order'},
    {name: 'assay'},
    {name: 'result'},
    {name: 'measurement'}
]);

App.models.Equipment = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'name'},
    {name: 'slug'},
    {name: 'address'},
    {name: 'order'},
    {name: 'is_active', type:'bool'}
]);

App.models.EquipmentTask = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'equipment_assay'},
    {name: 'ordered_service'},
    {name: 'equipment_name'},
    {name: 'service_name'},
    {name: 'patient_name'},
    {name: 'order'},
    {name: 'status'},
    {name: 'completed', type:'date', format:'c'},
    {name: 'created', type:'date', format:'c'}
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

App.models.ServiceToSend = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'created', type:'date', format:'c'},
    {name: 'service'},
    {name: 'service_name'},
    {name: 'patient_id'},
    {name: 'patient_sync_id'},
    {name: 'patient_name'},
    {name: 'patient_birth_day', type:'date', format:'c'}
]);

App.models.MedStandartModel = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'mkb10'},
    {name: 'name'},
    {name: 'age_category'},
    {name: 'age_category_name'},
    {name: 'stage'},
    {name: 'phase'},
    {name: 'nosological_form'},
    {name: 'complications'},
    {name: 'stage_name'},
    {name: 'phase_name'},
    {name: 'nosological_form_name'},
    {name: 'complications_name'},
    {name: 'terms_name'},
    {name: 'terms'}
]);

App.models.StandartItemModel = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'standart'},
    {name: 'service'},
    {name: 'service_name'},
    {name: 'price'},
    {name: 'frequency'},
    {name: 'average'}
]);

App.models.MedState = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'name'},
    {name: 'print_name'}
]);

App.models.BaseService = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'name'},
    {name: 'parent'},
    {name: 'base_group'},
    {name: 'execution_type_group'},
    {name: 'short_name'},
    {name: 'code'},
    {name: 'standard_service'},
    {name: 'execution_time'},
    {name: 'partnership'},
    {name: 'version'},
    {name: 'is_group'},
    {name: 'material'},
    {name: 'gen_ref_interval'},
    {name: 'lab_group'},
    {name: 'inner_template'},
    {name: 'conditions'},
    {name: 'description'},
    {name: 'type'}
]);

App.models.Patient = App.models.patientModel // patientModel will deprecate