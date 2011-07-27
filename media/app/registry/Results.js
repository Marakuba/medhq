Ext.ns('App');

App.Results = Ext.extend(Ext.Panel, {
	initComponent:function(){

		config = {
			id:'results-grid',
			title:'Результаты',
			closable:true,
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