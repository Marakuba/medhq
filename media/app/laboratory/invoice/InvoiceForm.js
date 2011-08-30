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
//				border:false
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
				},{
					layout:'form',
					items:[new Ext.form.LazyComboBox({
			        	fieldLabel:'Лаборатория',
			        	name:'state',
					    minChars:3,
					    emptyText:'Выберите лабораторию...',
					    proxyUrl:get_api_url('medstate'),
					    allowBlank:false
					})]
				},{
//					layout:'form',
					items:[{
						xtype:'button',
						text:'Заполнить',
						handler:function(){
							Ext.Ajax.request({
								url:'/lab/pull_invoice/',
								method:'POST',
								params:{
									invoice:this.record.id,
									state:App.uriToId(this.record.data.state)
								},
								success:function(response, opts){
									this.invoiceItem.getStore().load();
								},
								failure:function(response, opts){
									var obj = Ext.decode(response.responseText);
								},
								scope:this
							})
						},
						scope:this
					}]
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
		this.on('afterrender', function(){
			if(this.record) {
				this.getForm().loadRecord(this.record);
			}
		},this);
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

