Ext.ns('App');

App.Results = Ext.extend(Ext.Panel, {
	initComponent:function(){

		config = {
			title:'Результаты',
			layout:'border',
            defaults: {
				border:false
			},
			items:[{
				region:'center',
				width:'100%',
				split:true,
				layout:'fit',
				items:{
					xtype:'resultsgrid'
				}
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.Results.superclass.initComponent.apply(this, arguments);
		
	}
});

Ext.reg('results', App.Results);