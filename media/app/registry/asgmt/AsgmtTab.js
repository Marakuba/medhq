Ext.ns('App.assignment');



App.assignment.AsgmtTab = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.patientStore = this.patientStore || new Ext.data.RESTStore({
			autoLoad : false,
			apiUrl : get_api_url('patient'),
			model: App.models.patientModel
		});
		
		this.store = this.store || new Ext.data.RESTStore({
			autoLoad : false,
			apiUrl : get_api_url('preorder'),
			model: App.models.preorderModel
		});
		
		this.model = this.store.recordType;
	    
	    this.form = new App.assignment.AsgmtForm({
	    	region:'center',
        	baseCls:'x-border-layout-ct',
			model:this.model,
        	record:this.record,
        	patientRecord:this.patientRecord,
        	card_id:this.card_id,
        	type:this.type,
			fn:function(record){
				this.record = record;
				this.store.insertRecord(record);
				Ext.callback(this.fn, this.scope || window, [this.record]);
			},
			scope:this	
	    });
	    
		this.saveButton = new Ext.Button({
			text:'Сохранить',
			handler: this.onFormSave.createDelegate(this,[]),
//			disabled:true,
			scope:this
    	});
    	
    	this.payButton = new Ext.Button({
			text:'Сохранить и оплатить',
			handler: this.onFormSave.createDelegate(this,[true]),
//			disabled:true,
			scope:this
    	});
    	
    	this.patientButton = new Ext.Button({
			text:'Пациент',
			iconCls: 'silk-pencil',
			handler: this.onPatientEdit.createDelegate(this,[]),
			disabled:true,
			scope:this
    	});
		
		config = {
			layout:'fit',
			border:false,
			defaults: {
				border:false
//			    collapsible: true,
//			    split: true,
				//baseCls:'x-border-layout-ct',
			},
			tbar:[this.patientButton,
			      '->',{
        		text:'Закрыть',
				handler:this.onClose.createDelegate(this,[])
			},this.saveButton],
	        items:[this.form]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.assignment.AsgmtTab.superclass.initComponent.apply(this, arguments);
		
//		this.setTitle(this.getTitleText()); //TODO: make correct title
		
		this.on('render', function(){
			
			if (!this.patientId){
				return false
			};
			this.setTitle(this.getTitleText());
			this.patientStore.setBaseParam('id',this.patientId);
			this.patientStore.load({callback:function(records){
				if (!records.length){
					return
				};
				this.patientRecord = records[0];
				this.getPatientTitle();
				this.form.setPatientRecord(this.patientRecord);
			},scope:this});
			
			//если направление уже существует
			if (this.preorderId){
				this.store.setBaseParam('id',this.preorderId);
				this.store.load({callback:function(records){
					if (!records.length){
						return
					};
					this.record = records[0];
					this.form.setAssigmentRecord(this.record);
				},scope:this});
			};
		},this);
		
		this.store.on('write', this.onStoreWrite, this);
		this.on('destroy', function(){
			this.store.un('write', this.onStoreWrite, this);
		},this);
		
	},
	

	onFormSave: function(post_pay) {
		if (post_pay){
			this.post_pay = post_pay
			this.totalSum = this.form.getSum();
		} else {
			this.post_pay = undefined;
		};
		var f = this.form;
		this.steps = f.getSteps();
		this.tSteps = this.steps;
		if(this.steps>0) {
			this.msgBox = Ext.MessageBox.progress('Подождите','Идет сохранение документа!');
			f.on('popstep',this.popStep, this);
			f.onSave();
		} else {
			this.onClose(true);
		}
	},
	
	onClose: function(noConfirm){
		var steps = this.form.getSteps();
		if(noConfirm===undefined && steps>0) {
			Ext.MessageBox.show({
				title:'Подтверждение',
				closable:false,
				modal:true,
				buttons:{
					cancel:'Отменить закрытие',
					yes:'Сохранить и закрыть',
					no:'Не сохранять'
				},
				msg:'Документ не сохранен!',
				fn:function(btn){
					if(btn!='cancel') {
						if(btn=='yes') {
							this.onFormSave();
						} else if (btn=='no') {
							this.close();
						}
					}
				},
				scope:this
			});
		} else {
			if (this.post_pay != undefined) {
				//var c = this.form.getSum();
				this.win = new App.billing.PaymentWindow({
					is_income : true,
					amount:this.totalSum,
					patientRecord:this.patientRecord
				});
				this.win.show();
			};	
			this.close();
		}
	},
	
	close: function() {
		App.eventManager.fireEvent('closeapp',this.id);
	},
	
	onStoreWrite: function(store, action, result, res, rs) {
		if(action=='create') {
			App.eventManager.fireEvent('assigmentcreate',rs);
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
			Ext.callback(this.fn, this.scope || window);
			this.onClose(true);
//			this.fireEvent('savecomplete');
		}
	},

	getPatientTitle : function(){
		var rec = this.patientRecord;
		var text = '';
		if (rec){
			text = 'Пациент: ' + rec.data.last_name + ' ' + rec.data.first_name + ' ' + rec.data.mid_name;
			this.patientButton.setText(text);
			this.patientButton.enable()
		} else {
			this.patientButton.disable();
			console.log('Не указан пациент')
		}
		return text
	},
	
	getTitleText: function() {
		var title;
		if(this.preorderId) {
			title = 'Направление №'+this.preorderId;
		} else {
			title = 'Новое направление';
		}
		return title
	},
	
	onPatientEdit: function(){
		var rec = this.patientRecord;
		if (!rec){
			return false
		}
		this.pWin = new App.patient.PatientWindow({
			fn:function(record){
				this.patientRecord = record;
				this.getPatientTitle()
//				this.pWin.close()
			},
			listeners:{
				savecomplete:function(){
					this.pWin.close();
					this.patientStore.load();
				},
				scope:this
			},
			record:this.patientRecord,
			scope:this
		});
		
		this.pWin.show();
	}
});

Ext.reg('asgmttab', App.assignment.AsgmtTab);