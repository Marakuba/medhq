Ext.ns('App');

App.MainPanel = Ext.extend(Ext.Panel,{

	initComponent:function(){
		config = {
			title:'main panel'
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.MainPanel.superclass.initComponent.apply(this, arguments);
	}
});