Ext.ns('App');


App.MainPanel = Ext.extend(Ext.TabPanel, {
	
	initComponent: function(){
		config = {
			region:'center',
			border:false,
//			margins:'5 0 5 5',
			bodyCssClass:'splash'
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.MainPanel.superclass.initComponent.apply(this, arguments);
	}

});

Ext.reg('mainpanel',App.MainPanel);