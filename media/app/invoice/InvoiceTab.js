Ext.ns('App.invoice');


App.invoice.InvoiceTab = Ext.extend(Ext.Panel, {
	initComponent : function() {

		this.store = this.store || new Ext.data.RESTStore({
			autoLoad : true,
			autoSave:true,
			apiUrl : App.getApiUrl('invoice'),
			model: App.models.Invoice
		});

		this.model = this.store.recordType;

		this.form = new App.invoice.InvoiceForm({
			model:this.store.recordType,
			record:this.record,
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

		config = {
			title:'Накладная',
			layout:'fit',
			baseCls:'x-plain',
			border:false,
			defaults: {
				border:false
			},
			tbar:['->',{
        		text:'Закрыть',
				handler:this.onClose.createDelegate(this,[true])
			}/*,this.saveButton*/],
	        items:[this.form]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.invoice.InvoiceTab.superclass.initComponent.apply(this, arguments);

		this.store.on('write', this.onStoreWrite, this);
		this.on('destroy', function(){
			this.store.un('write', this.onStoreWrite, this);
		},this);

	},


	onFormSave: function() {
		var f = this.form;
		if(f.getForm().isValid()) {
			this.steps = f.getSteps();
			this.tSteps = this.steps;
			console.info(this.tSteps);
			if(this.steps>0) {
				this.msgBox = Ext.MessageBox.progress('Подождите','Идет сохранение документа!');
				f.on('popstep',this.popStep, this);
				f.onSave();
			} else {
				this.onClose(true);
			}
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
		App.eventManager.fireEvent('invoiceclose');
	},

	onStoreWrite: function(store, action, result, res, rs) {
		if(action=='create') {
			App.eventManager.fireEvent('invoicecreate',rs);
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

Ext.reg('invoicetab', App.invoice.InvoiceTab);
