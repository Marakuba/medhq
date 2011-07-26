Ext.ns('App','App.patient');

App.patient.PatientWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		this.store = this.store || new Ext.data.RESTStore({
			autoLoad : true,
			apiUrl : get_api_url('patient'),
			model: [
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
				    {name: 'initial_account'},
				    {name: 'billed_account'},
				    {name: 'doc'},
				    {name: 'hid_card'}
				]
		});
		
		this.model = this.store.recordType;
		
		this.form = new App.patient.PatientForm({
			model:this.model,
			record:this.record,
			fn:function(record){
				this.record = record;
				this.store.insertRecord(record);
				Ext.callback(this.fn, this.scope || window, [this.record]);
			},
			scope:this			
		});
		
		config = {
			title:'Пациент',
			width:650,
			height:450,
			layout:'fit',
			items:this.form,
			modal:true,
			border:false,
			buttons:[{
				text:'Сохранить',
				handler:this.onFormSave.createDelegate(this),
				scope:this
			},{
				text:'Закрыть',
				handler:this.onClose.createDelegate(this),
				scope:this
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.PatientWindow.superclass.initComponent.apply(this, arguments);
		this.store.on('write', this.onStoreWrite, this);
		this.on('destroy', function(){
			this.store.un('write', this.onStoreWrite, this);
		},this);
	},
	
	onFormSave: function() {
		var f = this.form;
		this.steps = f.getSteps();
		this.tSteps = this.steps;
		if(this.steps>0) {
			this.msgBox = Ext.MessageBox.progress('Подождите','Идет сохранение документа!');
			f.on('popstep',this.popStep, this);
			f.onSave();
		} else {
			this.fireEvent('savecomplete');
		}
	},
	
	onClose: function(){
		this.close();
	},
	
	onStoreWrite: function(store, action, result, res, rs) {
		this.popStep();
	},
	
	popStep: function() {
		this.steps-=1;
		if(this.msgBox) {
			var progress = (this.tSteps-this.steps) / this.tSteps;
			this.msgBox.updateProgress(progress);
		}
		if(this.steps===0) {
			if(this.msgBox) {
				this.msgBox.hide();
			}
			this.fireEvent('savecomplete');
		}
	}
});


Ext.reg('patientwindow', App.patient.PatientWindow);