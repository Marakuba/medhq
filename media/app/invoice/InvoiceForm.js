Ext.ns('App.invoice');

App.invoice.InvoiceForm = Ext.extend(Ext.FormPanel, {

	initComponent:function(){

		this.inlines = new Ext.util.MixedCollection({});

		this.invoiceItem = new App.invoice.InvoiceItemGrid({
			record:this.record,
			flex:1,
			border:true
		});

//		this.invoiceItem.store.on('write', function(){
//			this.fireEvent('popstep');
//		}, this);
//
//		this.inlines.add('invoiceitem', this.invoiceItem);

		config = {
			layout:{
				type:'vbox',
				align:'stretch'
			},
			defaults:{
				border:false
			},
			items:[{
				layout:{
					type:'hbox',
				},
				height:40,
				padding:5,
				border:false,
				defaults:{
					border:false,
					margins:'0 5 0 0'
				},
				items:[{
					layout:'form',
					items:[{
						xtype:'textfield',
						fieldLabel:'Номер',
						name:'id',
						readOnly:true
					}]
				},]
			},{
				layout:'hbox',
				height:40,
				padding:5,
				border:false,
				defaults:{
					border:false,
					margins:'0 5 0 0'
				},
				items:[{
					layout:'form',
					items:[new Ext.form.LazyComboBox({
			        	fieldLabel:'Офис',
			        	name:'office',
					    minChars:3,
					    emptyText:'Выберите офис...',
					    proxyUrl:App.getApiUrl('ownstate'),
					    allowBlank:false
					})]
				},{
					layout:'form',
					items:[new Ext.form.LazyComboBox({
			        	fieldLabel:'Лаборатория',
			        	name:'state',
					    minChars:3,
					    emptyText:'Выберите лабораторию...',
					    proxyUrl:App.getApiUrl('medstate'),
					    allowBlank:false
					})]
				},{
//					layout:'form',
					items:[{
						id:'invoice-pull-button',
						xtype:'button',
						text:'Заполнить и сохранить',
						handler:function(field){
							if(this.getForm().isValid()) {
								field.disable();
								if(this.record && !this.record.phantom) {
									this.pullItems();
								} else {
									this._pullDefer = true;
									this.onSave();
								}
							}
						},
						scope:this
					}]
				}]
			},{
				layout:'form',
				padding:5,
				items:[{
					xtype:'textarea',
					fieldLabel:'Комментарии',
					anchor:'100%',
					name:'comment',
					height:70
				}]
			},{
				flex:1,
				margins:'0 5 5 5',
				layout:'fit',
				border:true,
				items:this.invoiceItem
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.invoice.InvoiceForm.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('invoicecreate',this.onInvoiceCreate, this);
		this.on('afterrender', function(){
			if(this.record) {
				this.getForm().loadRecord(this.record);
			} else {
				console.info(App.getApiUrl('ownstate',active_state_id));
				this.getForm().findField('office').setValue(App.getApiUrl('ownstate',active_state_id));
			}
		},this);

		this.on('destroy', function(){
		    App.eventManager.un('invoicecreate',this.onInvoiceCreate, this);
		},this);
	},

	onInvoiceCreate: function(rec){
		this.record = rec;
		this.getForm().loadRecord(this.record);
		if(this._pullDefer) {
			this.pullItems();
			this._pullDefer = false;
		}
	},

	pullItems: function(){
		Ext.Ajax.request({
			url:'/lab/pull_invoice/',
			method:'POST',
			params:{
				invoice:this.record.id,
				office:App.uriToId(this.record.data.office),
				state:App.uriToId(this.record.data.state)
			},
			success:function(response, opts){
				var s = this.invoiceItem.getStore();
				s.setBaseParam('invoice', this.record.id);
				s.load();
				Ext.getCmp('invoice-pull-button').enable();
			},
			failure:function(response, opts){
				var obj = Ext.decode(response.responseText);
				Ext.getCmp('invoice-pull-button').enable();
			},
			scope:this
		})
	},

	getRecord: function() {
		if(!this.record) {
			if(this.model) {
				var Model = this.model;
				this.record = new Model();
			} else {
				Ext.MessageBox.alert('Ошибка','нет модели');
			}
		}
		return this.record;
	},

	onSave: function() {
		var f = this.getForm();
		if(f.isValid()){
			var Record = this.getRecord();
			f.updateRecord(Record);
			if(!Record.phantom) {
				this.inlines.each(function(inline,i,l){
					inline.onSave();
				});
			}
			if(this.fn) {
				Ext.callback(this.fn, this.scope || window, [Record]);
			}
		} else {
			Ext.MessageBox.alert('Предупреждение','Пожалуйста, заполните все поля формы!');
		}
	},

	getSteps : function() {
		var steps = 0;
		if(this.getForm().isDirty()) {
	        this.getForm().items.each(function(f){
	            if(f.isDirty()){
	            	console.info('dirty field:',f);
	            }
	         });
			steps+=1;
		}
		this.inlines.each(function(inline,i,l){
			var s = inline.getSteps();
			steps+=s;
		});
		return steps
	}


});

Ext.reg('invoiceform', App.invoice.InvoiceForm);

