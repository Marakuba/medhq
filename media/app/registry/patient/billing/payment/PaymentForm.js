Ext.ns('Ext.ux');
Ext.ns('Ext.billing');


App.billing.PaymentForm = Ext.extend(Ext.form.FormPanel, {
	

	initComponent: function(){
		
		this.tmp_id = Ext.id();
				
		/*this.cl_acc_store = new Ext.data.JsonStore({
			autoLoad:false,
			proxy: new Ext.data.HttpProxy({
			    url:'/api/billing/clientaccount',
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
    	});*/
    
		//this.is_income = true;
		config = {
			title:this.is_income==true ? 'Приходный ордер' : 'Расходный ордер',
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
					height:100,
					xtype:'fieldset',
					border:false,
					labelWidth:230,
					defaults:{
						layout:'form'
					},
					items:[{
						xtype:'compositefield',
						fieldLabel:this.is_income==true ? 'Приходный кассовый ордер №' : 'Расходный кассовый ордер №',
						itemCls:'doc-title',
						invalidClass:'x-plain',
						items:[{
							xtype:'textfield',
							name: 'id',
							disabled:true,
							width:70,
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
							columnWidth:0.4,
							items:[new Ext.form.LazyComboBox({
								fieldLabel:'Клиент',
								id:this.tmp_id+'client',
								proxyUrl:App.get_api_url('clients','client'),
								storeFields:['resource_uri','client_item','name'],
								allowBlank:false,
								displayField: 'name',
								anchor:'89%',
					        	//name:'client_item',
					        	listeners: 
					        	{
                                    scope:this,
                                    'select':function(combo, record, index){
                                    	var client_id = App.uri_to_id(record.id); 
                                    	this.getForm().findField('client_account').store.setBaseParam('client_item__client',client_id);
                                    	this.getForm().findField('client_account').store.load();
                                    	
                                    }
					        	}
							}),
							new Ext.form.LazyComboBox({
								fieldLabel:'Лицевой счет',
								anchor:'89%',
					        	name:'client_account',
					        	storeFields:['resource_uri','account_id','client_name'],
					        	proxyUrl:App.get_api_url('billing','clientaccount'),
                                allowBlank:false,
							    displayField: 'account_id',
							    selectOnFocus:true
							}),
							new Ext.form.ComboBox({
								name : 'payment_type',
								fieldLabel: 'Вид оплаты',
								typeAhead: true,
    							triggerAction: 'all',
    							anchor:'50%',
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
    							displayField: 'type'
							}),
							{
								xtype:'numberfield',
								name:'amount',
								fieldLabel:'Сумма',
								anchor:'50%',
								allowBlank:true,
								value:0
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
            }],

            bbar: new Ext.ux.StatusBar({
                id: 'statusbar' + this.id,
                defaultText: '',
                items: [{
     				text:'Сохранить',
					iconCls:'silk-save',
	   				scale:'medium',
                    handler : this.onSave,
                    scope:this
	   			},{
	   				text:'Закрыть',
	   				scale:'medium',
                    scope: this,
                    handler: this.onClose
	   			}]
            })
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.billing.PaymentForm.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('paymentcreate', this.onPmCreate, this);
		//App.eventManager.on('accountcreate', this.onAccountCreate, this);
		//App.eventManager.on('clientaccountcreate', this.onClientAccountCreate, this);
		
		this.on('afterrender', function(){
			if(this.record) {
				this.getForm().loadRecord(this.record);
				Ext.getCmp(this.tmp_id+'client').setValue(this.record.data.client);
				Ext.getCmp(this.tmp_id+'client').originalValue = this.record.data.client;
			}
			else {
                var d = new Date;
                this.getForm().findField('doc_date').setValue(d);
                this.getForm().findField('doc_date').originalValue = d;
            };
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
	}
});

Ext.reg('paymentform',App.billing.PaymentForm);
