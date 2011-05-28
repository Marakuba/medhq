Ext.ns('App');

App.Barcodes = Ext.extend(Ext.Panel, {
	initComponent:function(){

	    config = {
			title:'Штрих-коды',
			layout:'border',
            defaults: {
				border:false
			},
			items:[/*{
				region:'center',
				layout:'card',
				activeItem: 0,
		        items:[new Ext.Panel({
					html:'&laquo; Выберите прием'
		        })]
			},*/{
				region:'center',
				width:'100%',
				split:true,
				layout:'fit',
				items:{
					loadInstant:true,
					xtype:'barcodepackagegrid'
				}
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.Barcodes.superclass.initComponent.apply(this, arguments);
		
	}
});

Ext.reg('barcodes', App.Barcodes);