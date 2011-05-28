Ext.ns('App.barcode');

App.barcode.PrintWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		config = {
			title:'Выбор документов для печати',
			width:600,
			autoHeight:true,
			items: new App.barcode.Grid({
			
			}),
			modal:true,
			buttons:[{
				text:'Печатать',
				handler:function(){
					this.fireEvent('submit');
				},
				scope:this
			},{
				text:'Отмена'
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.barcode.PrintWindow.superclass.initComponent.apply(this, arguments);
	}

});