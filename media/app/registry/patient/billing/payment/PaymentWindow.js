Ext.ns('App','App.patient');

App.billing.PaymentWindow = Ext.extend(Ext.Window, {

	initComponent:function(){

		this.store = this.store || new Ext.data.RESTStore({
		    apiUrl : App.getApiUrl('payment'),
		    model: App.models.paymentModel
		});

		this.model = this.store.recordType;

		this.form = new App.billing.PaymentForm({
			model:this.model,
			patientRecord:this.patientRecord,
			amount:this.amount,
			is_income : this.is_income,
			record:this.record,
			patient_id: this.patient_id,
			fn:function(record){
				this.record = record;
				this.store.insertRecord(record);
				Ext.callback(this.fn, this.scope || window, [this.record]);
			},
			scope:this
		});

		this.statusbar = new Ext.ux.StatusBar({
                defaultText: '',
                items:[{
					text:'Печать чека',
					handler:this.onPrintCheck.createDelegate(this),
					scope:this
				},{
					text:'Сохранить',
					handler:this.onSave.createDelegate(this),
					scope:this
				},{
					text:'Закрыть',
					handler:this.onClose.createDelegate(this),
					scope:this
				}]
			})

		config = {
			title:(this.is_income==true ? 'Приходный ордер: ' : 'Расходный ордер: ')+
				(this.patientRecord? this.patientRecord.data.last_name:''),
			width:450,
			height:350,
			layout:'fit',
			items:this.form,
			modal:true,
			border:false,
			bbar:this.statusbar
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.billing.PaymentWindow.superclass.initComponent.apply(this, arguments);
		this.store.on('write', this.onStoreWrite, this);
		this.on('destroy', function(){
			this.store.un('write', this.onStoreWrite, this);
		},this);
	},

	onClose: function(){
		this.close();
	},

	onPrintCheck: function(){
		var f = this.form;
		f.onPrintCheck();
	},

	onStoreWrite: function(store, action, result, res, rs) {
		if(action=='create') {
			//App.eventManager.fireEvent('paymentcreate',rs);
		}
		App.eventManager.fireEvent('paymentsave',rs);
		this.record = rs;
		this.onClose();
		//Убрал статус бар, т.к. возникала ошибка при автоматическом закрытии окна(закрывалось раньше чем установится статус)
//		this.statusbar.setStatus({
//        	text: 'Документ успешно сохранён',
//            iconCls: 'silk-status-accept'
//        });
	},

	onSave: function() {
		var f = this.form;
		f.onSave();
	}
});


Ext.reg('paymentwindow', App.billing.PaymentWindow);
