Ext.ns('App','App.models');

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
	{name: 'resource_uri'},
	{name: 'print_name'},
	{name: 'print_date'},
	{name: 'base_service'},
	{name: 'staff'},
	{name: 'data'}
]);
	
App.models.Card = new Ext.data.Record.create([
   	{name: 'id'},
	{name: 'resource_uri'},
	{name: 'print_name'},
	{name: 'print_date'},
	{name: 'ordered_service'},
	{name: 'assistant'},
	{name: 'data'}
]);

App.models.FieldSet = new Ext.data.Record.create([
   	{name: 'id'},
	{name: 'resource_uri'},
	{name: 'name'},
	{name: 'order'},
	{name: 'title'}
]);

App.models.SubSection = new Ext.data.Record.create([
   	{name: 'id'},
	{name: 'resource_uri'},
	{name: 'section'},
	{name: 'section_name'},
	{name: 'title'}
]);