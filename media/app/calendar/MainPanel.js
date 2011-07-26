Ext.ns('App');
Ext.ns('App.calendar');


App.calendar.MainPanel = Ext.extend(Ext.TabPanel, {
	
	initComponent: function(){
		config = {
			region:'center',
			margins:'5 0 5 5'
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.calendar.MainPanel.superclass.initComponent.apply(this, arguments);
	}

});

Ext.reg('calmainpanel',App.calendar.MainPanel);