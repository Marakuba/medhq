Ext.ns('App.webapp');


App.webapp.MainPanel = Ext.extend(Ext.TabPanel, {
	
	initComponent: function(){
		config = {
			region:'center',
			border:false
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.webapp.MainPanel.superclass.initComponent.apply(this, arguments);
	}

});

Ext.reg('mainpanel',App.webapp.MainPanel);