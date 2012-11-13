Ext.ns('App');
Ext.ns('App.services');

App.CentralPanel = Ext.extend(Ext.Panel, {
	
	initComponent: function(){
		this.mainPanel = new App.MainPanel({});

		config = {
			region:'center',
			border:false,
			layout:'border',
			items:[this.mainPanel],
			tbar:[{
				xtype: 'buttongroup',
				title: '№ заказа или фамилия',
				padding:5,
				items:[{
					xtype:'gsearchfield'
					
				}]
			},{
                xtype: 'buttongroup',
                title: 'HelpDesk',
                columns: 2,
                defaults: {
                    scale: 'small'
                },
                items: [{
                    text: 'Журнал тикетов',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	this.launchApp('issuegrid');
                    },
                    scope:this
                }]
            },'->',{
            	text:'Выход',
            	handler:function(){
            		window.location.href = '/webapp/logout/';
            	}
            }]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.CentralPanel.superclass.initComponent.apply(this, arguments);
		WebApp.on('launchapp', this.launchApp, this);
		WebApp.on('closeapp', this.closeApp, this);
		
		this.on('destroy', function(){
		    WebApp.un('launchapp', this.launchApp, this);
			WebApp.un('closeapp', this.closeApp, this); 
		},this);
	},
	
	closeApp: function(appId) {
		this.mainPanel.remove(appId);
	},
	
	launchApp: function(appId,config) {
        var app_config = {
            xtype:appId
        };
        config = config || {};
		Ext.apply(app_config, config);
		var new_app = this.mainPanel.add(app_config);
		this.mainPanel.setActiveTab(new_app);
	}
});

Ext.reg('centralpanel', App.CentralPanel);
