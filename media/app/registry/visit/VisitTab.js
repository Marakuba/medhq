Ext.ns('App.visit');



App.visit.VisitTab = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.store = this.store || new Ext.data.RESTStore({
			autoLoad : false,
			apiUrl : get_api_url('visit'),
			model: [
				    {name: 'id'},
				    {name: 'resource_uri'},
				    {name: 'created', type:'date',format:'c'},
				    {name: 'cls', allowBlank: false},
				    {name: '_cache'},
				    {name: 'patient', allowBlank: false},
				    {name: 'patient_id'},
				    {name: 'barcode_id'},
				    {name: 'referral'},
				    {name: 'discount'},
				    {name: 'source_lab'},
				    {name: 'total_price'},
				    {name: 'total_paid'},
				    {name: 'total_sum'},
				    {name: 'operator_name'},
				    {name: 'patient_name'},
				    {name: 'payment_type'},
				    {name: 'insurance_policy'},
				    {name: 'comment'},
				    {name: 'pregnancy_week'},
				    {name: 'menses_day'},
				    {name: 'menopause'},
				    {name: 'diagnosis'},
				    {name: 'is_billed', type:'boolean'},
				    {name: 'referral_name'}
				]
		});
		
		this.model = this.store.recordType;
		
		this.servicePanel = new App.visit.VisitServicePanel({
	        region: 'east',
		    collapsible: true,
		    collapseMode: 'mini',
	        width: 300,
	        split: true
	    });		
	    
	    this.form = new App.visit.VisitForm({
	    	region:'center',
        	baseCls:'x-border-layout-ct',
			model:this.model,
        	record:this.record,
        	patientRecord:this.patientRecord,
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
		
		config = {
			layout:'fit',
			border:false,
			defaults: {
				border:false
//			    collapsible: true,
//			    split: true,
				//baseCls:'x-border-layout-ct',
			},
			tbar:[this.getPatientTitle(),'->',{
        		text:'Закрыть',
				handler:this.onClose.createDelegate(this,[])
			},this.saveButton],
	        items:[this.form]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.visit.VisitTab.superclass.initComponent.apply(this, arguments);
		
//		this.setTitle(this.getTitleText()); //TODO: make correct title
		
		this.store.on('write', this.onStoreWrite, this);
		this.on('destroy', function(){
			this.store.un('write', this.onStoreWrite, this);
		},this);
		
		this.on('render', function(){
			this.setTitle(this.getTitleText());
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
		App.eventManager.fireEvent('visitclose');
	},
	
	onStoreWrite: function(store, action, result, res, rs) {
		if(action=='create') {
			App.eventManager.fireEvent('visitcreate',rs);
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
			this.onClose(true);
//			this.fireEvent('savecomplete');
		}
	},

	getPatientTitle : function(){
		var rec = this.patientRecord;
		v = {};
		Ext.apply(v, rec.data);
		if(this.record && this.record.id) {
			Ext.apply(v,{
				visit:String.format(', прием №{0}',this.record.id)
			});
		}
		tpl = new Ext.Template(
			'Пациент: {last_name} {first_name} {mid_name}',
			'{visit}'
		);
		return tpl.apply(v);
	},
	
	getTitleText: function() {
		var title;
		if(this.record && this.record.data.id) {
			title = this.type == 'visit' ? 'Прием №'+this.record.data.id : 'Поступление биоматериала №'+this.record.data.id;
		} else {
			title = this.type == 'visit' ? 'Новый прием' : 'Новое поступление биоматериала';
		}
		return title
	}
});

Ext.reg('visittab', App.visit.VisitTab);