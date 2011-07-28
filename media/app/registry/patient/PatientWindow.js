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
				text:'Закрыть',
				handler:this.onClose.createDelegate(this),
				scope:this
			},{
				text:'Сохранить',
				handler:this.onFormSave.createDelegate(this),
				scope:this
			},{
				text:'Сохранить и перейти к приему',
				handler:this.onFormSave.createDelegate(this,[true]),
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
	
	onFormSave: function(post_visit) {
		this.post_visit = post_visit;
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
		if(action=='create') {
			App.eventManager.fireEvent('patientcreate',rs);
		}
		this.record = rs;
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
			if(this.inCard) {
				App.eventManager.fireEvent('launchapp','patientcard',{
					record:this.record
				});
			}
			if(this.post_visit) {
				App.eventManager.fireEvent('launchapp','visittab',{
					patientRecord:this.record,
					type:'visit'
				});
			}
			if(this.inCard) {
				this.close();
			}
		}
	}
});


Ext.reg('patientwindow', App.patient.PatientWindow);