Ext.ns('App','App.patient', 'App.direct');

App.patient.PatientWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		//устанавливается, если было подписано соглашение пациентом
		//при сохранении отправляется запрос на создание экземпляра модели Agreement
		this.setAcceptedDate = false; 
		
		this.store = this.store || new Ext.data.RESTStore({
			autoLoad : true,
			apiUrl : get_api_url('patient'),
			model: App.models.Patient,
			listeners:{
				scope:this,
				exception:this.onException
			}
		});
		
		this.model = this.store.recordType;
		
		this.form = new App.patient.PatientForm({
			model:this.model,
			record:this.record,
			fn:function(record){
				this.record = record;
				this.store.insertRecord(this.record);
//				if(!this.record.phantom) this.popStep()
			},
			listeners:{
				scope:this,
				exception:this.onException
			},
			scope:this			
		});
		
		this.postMaterialBtn = new Ext.Button({
			iconCls:'med-testtubes',
			text:'Сохранить и перейти к поступлению б/м',
			handler:this.onFormSave.createDelegate(this,['material']),
			disabled:this.fromVisit?true:false,//если окно открыто из визита, то новый визит создавать не надо
			scope:this
		});
		
		this.postVisitlBtn = new Ext.SplitButton({
			iconCls:'med-usersetup',
			text:'Сохранить и перейти к приему',
			handler:this.onFormSave.createDelegate(this,['visit']),
			disabled:this.fromVisit?true:false,
			menu:[{
				iconCls:'med-testtubes',
				text:'Сохранить и перейти к поступлению б/м',
				handler:this.onFormSave.createDelegate(this,['material']),
				disabled:this.fromVisit?true:false,
				scope:this
			}],
			scope:this
		});
		
		config = {
			title:'Пациент',
			width:650,
			height:480,
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
				handler:this.onFormSave.createDelegate(this,[false]),
				scope:this
			},App.settings.strictMode ? this.postMaterialBtn : this.postVisitlBtn]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.PatientWindow.superclass.initComponent.apply(this, arguments);
		this.store.on('write', this.onStoreWrite, this);
		this.store.on('exception', this.onException, this);
		this.on('destroy', function(){
			this.store.un('write', this.onStoreWrite, this);
			this.store.un('exception',this.onException,this);
		},this);
		this.form.on('accepted',this.onFormSave.createDelegate(this,[false]),this);
	},
	
	onFormSave: function(post_visit) {
		this.post_visit = post_visit;
		var f = this.form;
		this.steps = f.getSteps();
		if (this.setAcceptedDate){
			this.steps += 1;
			this.createAgreement();
		}
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
		console.log(rs)
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
			Ext.callback(this.fn, this.scope || window, [this.record]);
			if(this.inCard) {
				App.eventManager.fireEvent('launchapp','patientcard',{
					record:this.record
				});
			}
			if(this.post_visit) {
				App.eventManager.fireEvent('launchapp','visittab',{
					patientId:this.record.data.id,
					type:this.post_visit
				});
			}
			if(this.inCard) {
				this.close();
			}
		}
	},
	
	acceptedUrlTpl: '/patient/acceptance/{0}/',
	
	onAccepted: function(){
		
		if (!this.record.data.accepted){
			Ext.Msg.confirm('Подтверждение','Согласие подписано пациентом?',function(btn){
				if (btn=='yes'){
//					this.form.setAcceptedDate();
					this.setAcceptedDate = true;
				}
			
			},this);
		}
		var url = String.format(this.acceptedUrlTpl,this.record.data.id);
		window.open(url);
	},
	
	createAgreement: function(){
		params = {}
		params['patient'] = this.record.data.id;
		params['state'] = state;
		console.log(params)
		App.direct.patient.setAcceptedDate(params,function(res){
			console.log(res);
			this.record.data['accepted']
			this.popStep();
		},this)
	},
	
	onException: function(proxy,type,action,options,response,other){
		status_text = {
				0:'Нет связи с сервером.',	
				404:'Путь сохранения не найден.',	
				500:'Во время сохранения записи произошла ошибка на сервере.',	
		};
		if(this.msgBox) {
			this.msgBox.hide();
		};
		Ext.Msg.alert('Ошибка!',String.format('{0} Попробуйте позже.',status_text[response.status]));
	}
});


Ext.reg('patientwindow', App.patient.PatientWindow);