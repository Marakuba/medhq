Ext.ns('App');
Ext.ns('App.services');
Ext.ns('App.registry');

App.StatusBar = new Ext.ux.StatusBar({
	hidden:true,
	defaultText: 'Готово',
	defaultIconCls: 'x-status-valid',
	autoClear:3000,
	items:[String.format('{0}, {1}', active_user, active_state)]
}); 

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
		
		this.connStatus = new Ext.Button({
			iconCls:'silk-stop',
			hidden:true
		});
		
		this.mainPanel = new App.MainPanel({});
		
		this.preorderBtn = new Ext.SplitButton({
			text:'Предзаказы',
			tooltip:'Управление предзаказами',
			handler:function(){
				this.launchApp('preordermanager',{closable:true,openTab:'preorderTab'});
			},
			menu: new Ext.menu.Menu({
		        items: [
		        	// these items will render as dropdown menu items when the arrow is clicked:
			        {text: 'Ближайшие предзаказы', handler: function(){
							this.launchApp('preordermanager',{closable:true,openTab:'preorderTab'});
						},
					scope:this
					},
			        {text: 'Направления', handler: function(){
							this.launchApp('preordermanager',{closable:true,openTab:'assigmentTab'});
						}, scope: this
					},
					{text: 'Выполненные предзаказы', handler: function(){
							this.launchApp('preordermanager',{closable:true,openTab:'completedTab'});
						}, scope: this
					}
		        ]
		   	}),
			scope:this
		});
		
		this.ttb = new Ext.Toolbar({
			items:[{
				xtype:'buttongroup',
				defaults:{
					xtype:'button',
					scale:'medium'
				},
				items:[{
					text:'Отчеты',
					tooltip:'Перечень отчетов',
					handler:function(){
						this.launchApp('reports');
					},
					scope:this
				}]
			},'->',{
				xtype:'buttongroup',
				defaults:{
					xtype:'button',
					scale:'medium'
				},
				hidden:App.settings.strictMode,
				items:[{
					text:'Обращения',
					handler:function(){
						this.launchApp('issuegrid');
					},
					scope:this
				}]
			},{
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
			},this.connStatus]
		});

		config = {
			region:'center',
			border:false,
			layout:'border',
			items:[this.mainPanel],
			tbar:this.ttb,
	        bbar: App.StatusBar
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.CentralPanel.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('launchapp', this.launchApp, this);
		App.eventManager.on('closeapp', this.closeApp, this);
		this.on('afterrender', function(){
		});
		
		
		this.on('destroy', function(){
		    App.eventManager.un('launchapp', this.launchApp, this);
			App.eventManager.un('closeapp', this.closeApp, this);
		},this);
		
		Ext.Direct.on('netstatus',function(){
			this.connStatus.setIconClass('silk-tick');
		}, this);

		Ext.Direct.on('exception',function(){
			this.connStatus.setIconClass('silk-stop');
		}, this);

	},
	
	closeApp: function(appId) {
		this.mainPanel.remove(appId);
	},
	
	launchApp: function(appId,config, setActive) {
        var app_config = {
            xtype:appId,
            medstateStore:this.medstateStore,
            searchValue: this.searchValue
        };
        config = config || {};
		Ext.apply(app_config, config);
		var new_app = this.mainPanel.add(app_config);
		setActive = setActive==undefined ? true : setActive;
		if(setActive) {
			this.mainPanel.setActiveTab(new_app);
		}
	}
	
});

Ext.reg('centralpanel', App.CentralPanel);
