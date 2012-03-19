Ext.ns('App.barcodepackage');

App.barcodepackage.DuplicateWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		this.params = this.params || {};
		
		this.form = new Ext.form.FormPanel({
			baseCls:'x-plain',
			defaults:{
				border:false,
				baseCls:'x-plain'
			},
			labelAlign:'top',
			items:[{
				xtype:'numberfield',
				allowBlank:false,
				fieldLabel:'Введите штрих код вручную или через сканер',
				name:'code',
				value:this.params.code || '',
				anchor:'99%',
				style:{
					fontSize:'2em',
					height:'1.3em'
				},
				listeners: {
	                specialkey: function(field, e){
	                    if (e.getKey() == e.ENTER) {
	                        this.form.getForm().findField('lat').focus(true,100);
	                    }
	                },
	                scope:this
	            }
			},{
				xtype:'textfield',
				allowBlank:false,
				fieldLabel:'ФИО пациента (лат.)',
				name:'lat',
				anchor:'99%',
				style:{
					fontSize:'2em',
					height:'1.3em'
				},
				value:this.params.lat || '',
				listeners: {
	                specialkey: function(field, e){
	                    if (e.getKey() == e.ENTER) {
	                        this.form.getForm().findField('count').focus(true,100);
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
				minValue:1,
				maxValue:5,
				name:'count',
				value:this.params.count || 1,
				listeners: {
	                specialkey: function(field, e){
	                    if (e.getKey() == e.ENTER) {
	                        this.onPrint();
	                    }
	                },
	                scope:this
	            }
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
				text:'Печать',
				handler:this.onPrint.createDelegate(this)
			},{
				text:'Закрыть',
				handler:function(){
					this.close();
				},
				scope:this
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.barcodepackage.DuplicateWindow.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender', function(){
			//this.form.getForm().findField('code').focus(true, 350);
			this.cleaningUp();
		}, this);

	},
	
	cleaningUp : function(){
		var f = this.form.getForm();
		f.findField('code').reset();
		f.findField('code').focus(true, 350);
		f.findField('count').reset();
	},
	
	onPrint : function(){
		var f = this.form.getForm();
		if(App.WebSocket && App.WebSocket.readyState!==0 ){
			if(f.isValid()) {
				code = f.findField('code').getValue();
				lat = f.findField('lat').getValue();
				count = f.findField('count').getValue();
				params = [code,"Euromed",count,lat];
				App.WebSocket.send(params.join("::"));
				this.cleaningUp();
			} else {
				Ext.MessageBox.alert('Ошибка','Необходимо заполнить все поля!');
			}
		} else {
			Ext.MessageBox.alert('Ошибка','Принтер штрих-кодов не подключен!');
		}
	}

});