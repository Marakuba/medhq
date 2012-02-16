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
                title: 'Журналы',
//                columns: 2,
                defaults: {
                    scale: 'small'
                },
                items: [{
                	xtype:'button',
                    text: 'Заказы',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	this.launchApp('labboard');
                    },
                    scope:this
                },{
                	xtype:'button',
                    text: 'Ручные исследования',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	this.launchApp('manualgrid');
                    },
                    scope:this
                },{
                    text: 'Реестр тестов',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	var win = new App.laboratory.RegisterWindow({});
                    	win.show(this.getEl());
                    },
                    scope:this
                }]
            },{
            	xtype:'buttongroup',
            	title:'Анализаторы',
            	defaults:{
            		
            	},
            	items:[{
            		text:'Исследования',
            		scale:'medium',
                    handler: function(){
                    	this.launchApp('equipmentassaygrid');
                    },
                    scope:this            	
                },{
            		text:'Результаты',
            		scale:'medium',
                    handler: function(){
                    	this.launchApp('equipmentresultgrid');
                    },
                    scope:this            	
                },{
            		text:'Оборудование',
            		scale:'medium',
                    handler: function(){
                    	this.launchApp('equipmentgrid');
                    },
                    scope:this            	
                },{
            		text:'Задания',
            		scale:'medium',
                    handler: function(){
                    	this.launchApp('equipmenttaskgrid');
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
		App.eventManager.on('launchapp', this.launchApp, this);
		App.eventManager.on('closeapp', this.closeApp, this);
		
		this.on('destroy', function(){
		    App.eventManager.un('launchapp', this.launchApp, this);
			App.eventManager.un('closeapp', this.closeApp, this); 
		},this);
	},
	
	closeApp: function(appId) {
		this.mainPanel.remove(appId);
	},
	
	launchApp: function(appId,config,active) {
        var app_config = {
            xtype:appId
        };
        config = config || {};
		Ext.apply(app_config, config);
		var new_app = this.mainPanel.add(app_config);
		active = active===undefined ? true : active;
		if(active) {
			this.mainPanel.setActiveTab(new_app);
		}
	}
});

Ext.reg('centralpanel', App.CentralPanel);
