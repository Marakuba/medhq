Ext.ns('Ext.ux');
Ext.ns('Ext.billing');


App.billing.PaymentForm = Ext.extend(Ext.form.FormPanel, {
	

	initComponent: function(){
		
		this.tmp_id = Ext.id();
		this.store = this.store || new Ext.data.RESTStore({
		    apiUrl : get_api_url('payment'),
		    baseParams:{
		    	format:'json'
		    },
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
				
		this.cl_acc_store = new Ext.data.JsonStore({
			autoLoad:false,
			proxy: new Ext.data.HttpProxy({
			    url:get_api_url('clientaccount'),
				method:'GET'
			}),
			root:'objects',
			idProperty:'resource_uri',
			fields:['resource_uri','client_item','account_id'],
			writer : new Ext.data.JsonWriter({
		    	encode: false,
            	writeAllFields: true 
			}),
			baseParams : {
		    	format:'json'
			}
    	});
    	
    	this.amountField = new Ext.form.NumberField({ 
            fieldLabel: 'Сумма',
            name: 'amount',
            width:140,
			allowBlank:true,
            minValue: 0,
            value: 0,
            listeners: {
                specialkey: function(field, e){
                    if (e.getKey() == e.ENTER) {
                        this.onSave();
                    }
                },
                scope:this
            }
        });
    
		//this.is_income = true;
		config = {
			//title:this.is_income==true ? 'Приходный ордер' : 'Расходный ордер',
			closable:true,
			layout:'border',
          	trackResetOnLoad:true,
			items:
			[	
				{
				baseCls:'x-border-layout-ct',
				region:'center',
				layout:'border',
				items:[{
					region:'center',
					//height:200,
					xtype:'fieldset',
					border:false,
					labelWidth:75,
					defaults:{
						layout:'form'
					},
					items:[{
						xtype:'compositefield',
						fieldLabel:'№',
						itemCls:'doc-title',
						invalidClass:'x-plain',
						items:[{
							xtype:'textfield',
							name: 'id',
							disabled:true,
							padding:'2',
							width:75,
							allowBlank:true
						},{
							xtype:'displayfield',
							value:'от'
						},{
							xtype:'datefield',
							name:'doc_date',
							format:'d.m.Y',
							allowBlank:false
						}]
					},{
						layout: {
							type:'column'
						},
						baseCls:'x-border-layout-ct',
						border:false,
						defaults:{
							xtype:'fieldset',
							layout:'form',
							border:false,
							padding:'2',
							labelWidth:75
						},
						items:[{
							columnWidth:1,
							items:[
							new Ext.form.LazyComboBox({
								fieldLabel:'Лицевой счет',
								anchor:'71%',
					        	name:'client_account',
					        	store:this.cl_acc_store,
                                allowBlank:false,
							    displayField: 'account_id',
							    selectOnFocus:true
							}),
							new Ext.form.ComboBox({
								name : 'payment_type',
								fieldLabel: 'Вид оплаты',
								typeAhead: true,
    							triggerAction: 'all',
    							anchor:'71%',
    							lazyRender:true,
    							mode: 'local',
    							store: new Ext.data.ArrayStore({
        							id: 0,
        							fields: [
            							'value',
            							'type'
        							],
        							data:   [['cash', 'Наличные'], ['non_cash', 'Безналичный расчет'],
        									['card','Банковская карта']]
    							}),
    							valueField: 'value',
    							value:'cash',
    							displayField: 'type'
							}),
							this.amountField,{
								xtype:'textarea',
								name:'comment',
								fieldLabel:'Примечание',
								anchor:'98%',
								autoScroll:true,
								allowBlank:true
							},
							{
								xtype:'hidden',
								name:'income',
								allowBlank:true,
								value:this.is_income==true ? true : false
							}
							]
                        }]
                    }]
				}]
            }]

		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.billing.PaymentForm.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('paymentcreate', this.onPmCreate, this);
		//App.eventManager.on('accountcreate', this.onAccountCreate, this);
		//App.eventManager.on('clientaccountcreate', this.onClientAccountCreate, this);
		
		this.on('afterrender', function(){
			if (this.patientRecord) {
                this.getForm().findField('client_account').store.setBaseParam('client_item__client',
                														this.patientRecord.data.id);
                this.getForm().findField('client_account').store.load({callback:this.setAccount,scope:this});
            }
			if(this.record) {
				this.getForm().loadRecord(this.record);
				//Ext.getCmp(this.tmp_id+'client').setValue(this.record.data.client);
				//Ext.getCmp(this.tmp_id+'client').originalValue = this.record.data.client;
			}
			else {
                var d = new Date;
                this.getForm().findField('doc_date').setValue(d);
                this.getForm().findField('doc_date').originalValue = d;
            };
            this.amountField.focus(true,1000);
		},this);
	
		/*this.on('paymentcreate', function(record){
			this.record = record;
			this.getForm().loadRecord(this.record);
			this.getForm().findField('number').setValue(this.record.data.id);
			this.getForm().findField('number').originalValue = this.record.data.id;
		},this);*/
	},
	
	onPmCreate: function(record) {
		this.record = record;
		this.getForm().loadRecord(this.record);
	},
	
	getRecord: function() {
		if(!this.record) {
			if(this.model) {
				var Model = this.model;
				this.record = new Model();
			} else {
				console.log('Ошибка: нет модели');
			}
		}
		return this.record;
	},
	
	onSave: function() {
		var f = this.getForm();
		if(f.isValid()){
			var Record = this.getRecord();
			/*this.cl_acc_store.baseParams = {
				client: this.getForm().findField('client').getValue(),
				account: this.getForm().findField('account').getValue()
			}
			this.cl_acc_store.load();
			if (!this.cl_acc_store.Count()) {
				
			}*/
			f.updateRecord(Record);
			if(this.fn) {
				Ext.callback(this.fn, this.scope || window, [Record]);
			}
            //this.markDirty(false);
		} else {
			Ext.MessageBox.alert('Предупреждение','Пожалуйста, заполните все поля формы!');
		}
	},

	onClose: function() {
		this.isModified();
		this.destroy();
	},
	
	isModified: function() {
		console.log('is form dirty:', this.getForm().isDirty());
        
        this.getForm().items.each(function(f){
           if(f.isDirty()){
			console.log('dirty field:',f);
           }
        });
	},
	
	setAccount: function(records,opt,success){
		var combo = this.getForm().findField('client_account');
		if (records&&!this.record) {
			var rec = records[0];
			combo.setValue(rec.data.resource_uri);
			combo.originalValue = rec.data.resource_uri;
		}
	}
});

Ext.reg('paymentform',App.billing.PaymentForm);
