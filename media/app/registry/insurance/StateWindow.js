Ext.ns('App.insurance');

App.insurance.StateWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		config = {
			title:'Страховые компании',
			width:500,
			height:300,
			layout:'fit',
			items: new App.insurance.StateGrid({
			}),
			modal:true
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.insurance.StateWindow.superclass.initComponent.apply(this, arguments);
	}

});