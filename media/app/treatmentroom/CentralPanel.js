Ext.ns('App');

App.CentralPanel = Ext.extend(Ext.Panel, {
	
	initComponent: function(){
		this.mainPanel = new App.MainPanel({});

		config = {
			region:'center',
			border:false,
			layout:'border',
			items:[this.mainPanel]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.CentralPanel.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('launchapp', this.launchApp, this);
		
		this.on('destroy', function(){
		    App.eventManager.un('launchapp', this.launchApp, this); 
		},this);
	},
	
	getActiveApp: function(){
		return this.items.itemAt(0).getActiveTab();
	},
	
	launchApp: function(appId,config,active) {
        var app_config = {
            xtype:appId
        };
        config = config || {};
		Ext.apply(app_config, config);
		var new_app = this.mainPanel.add(app_config);
		if(active){
			this.mainPanel.setActiveTab(new_app);
		}
	}
});

Ext.reg('centralpanel', App.CentralPanel);
