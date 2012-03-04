Ext.ns('App.barcodepackage');

App.barcodepackage.DuplicateWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		this.form = new Ext.form.FormPanel({
			baseCls:'x-plain',
			defaults:{
				border:false,
				baseCls:'x-plain'
			},
			labelAlign:'top',
			items:[{
				xtype:'textfield',
				allowBlank:false,
				fieldLabel:'Введите штрих код вручную или через сканер',
				name:'code',
				width:200,
				style:{
					fontSize:'2em',
					height:'1.3em'
				},
				listeners: {
	                specialkey: function(field, e){
	                    if (e.getKey() == e.ENTER) {
	                        this.form.getForm().findField('count').focus(false,100);
	                    }
	                },
	                scope:this
	            }
			},{
				xtype:'numberfield',
				allowBlank:false,
				fieldLabel:'Укажите количество дубликатов',
				width:50,
				style:{
					fontSize:'2em',
					height:'1.3em'
				},
				name:'count'
			}]
		});
		
		config = {
			title:'Печать дубликатов штрих-кода',
			width:350,
			autoHeight:true,
			items: this.form,
			modal:true,
			padding:5,
			defaults:{
				border:false,
				baseCls:'x-plain'
			},
			buttons:[{
				text:'Сформировать',
				handler:this.onPrint.createDelegate(this)
			},{
				text:'Отмена',
				handler:function(){
					this.close();
				},
				scope:this
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.barcodepackage.DuplicateWindow.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender', function(){
			this.form.getForm().findField('code').focus(false, 350);
		}, this);

	},
	
	onPrint : function(){
		if(App.WebSocket && App.WebSocket.readyState!==0){
			code = this.form.getForm().findField('code').getValue();
			count = this.form.getForm().findField('count').getValue();
			params = [code,"Euromed",count];
			App.WebSocket.send(params.join("::"));
		} else {
			Ext.MessageBox.alert('Ошибка','Принтер штрих-кодов не подключен!');
		}
	}

});