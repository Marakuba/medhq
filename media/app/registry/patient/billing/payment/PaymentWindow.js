Ext.ns('App','App.patient');

App.billing.PaymentWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		this.store = this.store || new Ext.data.RESTStore({
		    apiUrl : get_api_url('payment'),
		    model: [
    		    {name: 'id'},
    		    {name: 'doc_date', allowBlank: true, type:'date', format: 'd.m.Y'}, 
	    	    {name: 'client_account', allowBlank: true}, 
	    	    {name: 'client_name', allowBlank: true}, 
	    	    {name: 'client', allowBlank: true}, 
	    	    {name: 'amount', allowBlank: true},
	    	    {name: 'account_id', allowBlank: true},
	    	    {name: 'income', allowBlank: true},
	    	    {name: 'payment_type', allowBlank: true},
	    	    {name: 'comment', allowBlank: true},
	    	    {name: 'content_type', allowBlank: true}
			]
		});
		
		this.model = this.store.recordType;
		
		this.form = new App.billing.PaymentForm({
			model:this.model,
			patientRecord:this.patientRecord,
			amount:this.amount,
			is_income : this.is_income,
			record:this.record,
			fn:function(record){
				this.record = record;
				this.store.insertRecord(record);
				Ext.callback(this.fn, this.scope || window, [this.record]);
			},
			scope:this			
		});
		
		config = {
			title:(this.is_income==true ? 'Приходный ордер: ' : 'Расходный ордер: ')+
				(this.patientRecord? this.patientRecord.data.last_name:''),
			width:450,
			height:350,
			layout:'fit',
			items:this.form,
			modal:true,
			border:false,
			buttons:[{
				text:'Печать',
				//handler:this.onSave.createDelegate(this),
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
	
	
	
	onStoreWrite: function(store, action, result, res, rs) {
		if(action=='create') {
			//App.eventManager.fireEvent('paymentcreate',rs);
		}
		App.eventManager.fireEvent('paymentsave',rs);
		this.record = rs;
	},
	
	onSave: function() {
		var f = this.form;
		f.onSave();
	}
});


Ext.reg('paymentwindow', App.billing.PaymentWindow);