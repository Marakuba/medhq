Ext.ns('App.barcodepackage');

App.barcodepackage.DuplicateWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		this.form = new Ext.form.FormPanel({
			labelAlign:'top',
			items:[{
				xtype:'textfield',
				allowBlank:false,
				fieldLabel:'Введите штрих код вручную или через сканер',
				name:'code'
			},{
				xtype:'numberfield',
				allowBlank:false,
				fieldLabel:'Укажите количество дубликатов',
				name:'count'
			}]
		});
		
		config = {
			title:'Печать дубликатов штрих-кода',
			width:250,
			autoHeight:true,
			items: this.form,
			modal:true,
			padding:5,
			buttons:[{
				text:'Сформировать',
				handler:function(){
					var v = this.form.getForm().getValues();
					var url = ['/numeration/duplicate',v.code,v.count,''].join('/');
					window.open(url);
				},
				scope:this
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
	}

});