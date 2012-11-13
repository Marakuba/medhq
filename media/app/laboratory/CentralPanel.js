Ext.ns('App');
Ext.ns('App.services');

var profileItems = ['<b class="menu-title">Выберите профиль</b>'];
Ext.each(profiles, function(profile){
	config = {
		profileId:profile[0],
		text:profile[1],
		checked:profile[0]==active_profile,
		group:'profile',
		checkHandler:function(menuitem,checked){
			if(checked){
				window.location.href = String.format('/webapp/setactiveprofile/{0}/?redirect_to=/webapp/registry/',menuitem.profileId);
			}
		}
	}
	profileItems.push(config);
});

var appsItems = [];
Ext.each(apps, function(app){
	config = {
		text:app[0],
		appUrl:app[1],
		group:'apps',
		handler:function(menuitem,e){
			window.location.href = menuitem.appUrl;
		}
	}
	appsItems.push(config);
});

App.CentralPanel = Ext.extend(Ext.Panel, {
	
	initComponent: function(){
		this.mainPanel = new App.MainPanel({});
		
		this.gsf = new App.SearchField({
			id:'global-search-field',
			emptyText:'Ф.И.О. д/р или № заказа'
		});

		config = {
			region:'center',
			border:false,
			layout:'border',
			items:[this.mainPanel],
			tbar:[{
				xtype: 'buttongroup',
				padding:5,
				items:[this.gsf]
			},{
                xtype: 'buttongroup',
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
                },/*{
                	xtype:'button',
                    text: 'Ручные исследования',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	this.launchApp('manualgrid');
                    },
                    scope:this
                },*/{
                	xtype:'button',
                    text: 'Журнал',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	this.launchApp('investigationgrid');
                    },
                    scope:this
                },{
                    text: 'Реестр тестов',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	this.launchApp('labregisterapp');
//                    	var win = new App.laboratory.RegisterWindow({});
//                    	win.show(this.getEl());
                    },
                    scope:this
                }]
            },{
            	xtype:'buttongroup',
            	defaults:{
            		scale:'medium'
            	},
            	items:[{
            		text:'Проверка образца',
            		handler:this.openScannerWindow
            	},{
            		text:'Задания',
            		scale:'medium',
                    handler: function(){
                    	this.launchApp('equipmenttaskgrid');
                    },
                    scope:this            	
                },{
            		text:'Загрузка результатов',
            		scale:'medium',
                    handler: function(){
                    	this.launchApp('labresultloaderapp');
                    },
                    scope:this            	
                },{
					text:'Дубликат ш/к',
					tooltip:'Печать дубликата',
					handler:function(btn){
						var win = new App.barcodepackage.DuplicateWindow();
						win.show(btn);
					}
				}]
            },{
            	xtype:'buttongroup',
            	defaults:{
            		scale:'medium'
            	},
            	items:[{
            		text:'Исследования',
                    handler: function(){
                    	this.launchApp('equipmentassaygrid');
                    },
                    scope:this            	
                },{
            		text:'Оборудование',
            		scale:'medium',
                    handler: function(){
                    	this.launchApp('equipmentgrid');
                    },
                    scope:this            	
                }]
            },'->',/*{
				xtype:'buttongroup',
				defaults:{
					xtype:'button',
					scale:'medium'
				},
				items:[{
					text:'Обращения',
					handler:function(){
						this.launchApp('issuegrid');
					},
					scope:this
				}]
			},*/{
				xtype:'buttongroup',
				defaults:{
					xtype:'button',
					scale:'medium'
				},
				items:[{
					iconCls:'silk-cog',
					iconAlign:'right',
					text:String.format('{0}, {1}', active_user, active_state),
					menu:new Ext.menu.Menu({
						items:[{
							text:'Приложения',
							menu:{
								items:appsItems
							}
						},{
							text:'Профиль',
							menu:{
								items:profileItems
							}
						},{
			            	text:'Выход',
			            	iconCls:'silk-door-out',
			            	handler:function(){
			            		window.location.href = '/webapp/logout/';
			            	}
			            }]
					})
				}]
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.CentralPanel.superclass.initComponent.apply(this, arguments);
		WebApp.on('launchapp', this.launchApp, this);
		WebApp.on('closeapp', this.closeApp, this);
		WebApp.on('globalsearch', this.onGlobalSearch, this);
		
		this.on('destroy', function(){
		    WebApp.un('launchapp', this.launchApp, this);
			WebApp.un('closeapp', this.closeApp, this); 
			WebApp.un('globalsearch', this.onGlobalSearch, this);
		},this);
	},
	
	onSearch: function(){
		this.gsf.focus(true,100);
	},
	
	onClearSearch : function(){
		this.gsf.onTrigger1Click();
	},
	
	closeApp: function(appId) {
		this.mainPanel.remove(appId);
	},
	
	launchApp: function(appId,config,active) {
        var app_config = {
            xtype:appId,
            searchValue: this.searchValue,
            centralPanel : this
        };
        config = config || {};
		Ext.apply(app_config, config);
		var new_app = this.mainPanel.add(app_config);
		active = active===undefined ? true : active;
		if(active) {
			this.mainPanel.setActiveTab(new_app);
		}
	},
	
	onGlobalSearch: function(val){
		this.searchValue = val;
	},
	
	openScannerWindow: function(){
		var win = new App.laboratory.ScannerWindow();
		win.show();
	}
});

Ext.reg('centralpanel', App.CentralPanel);
