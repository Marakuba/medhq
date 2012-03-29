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

function onProfileCheck() {
	console.info(arguments);
}

profileItems = ['<b class="menu-title">Выберите профиль</b>'];
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

App.CentralPanel = Ext.extend(Ext.Panel, {
	
	initComponent: function(){
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
			items:[/*{
				xtype:'button',
				width:100,
				scale:'medium',
				iconCls:'icon-main-button',
				menu:[{
				}]
			},*/{
				xtype: 'buttongroup',
				padding:5,
				items:[{
					id:'global-search-field',
					xtype:'gsearchfield',
					emptyText:'Ф.И.О. д/р или № заказа',
					stripCharsRe:new RegExp('[\;\?]')
				}]
			},{
				xtype:'buttongroup',
				defaults:{
					xtype:'button',
					scale:'medium'
				},
				items:[{
					text:'Приемы',
					tooltip:'Журнал приемов пациентов',
					handler:function(){
						this.launchApp('visits');
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
					text:'Заказы',
					handler:function(){
						this.launchApp('remoteordergrid');
					},
					scope:this
				},{
					text:'Результаты',
					tooltip:'Журнал результатов анализов',
					handler:function(){
						this.launchApp('results');
					},
					scope:this
				}]
			},{
				xtype:'buttongroup',
				defaults:{
					xtype:'button',
					scale:'medium'
				},
				hidden:App.settings.strictMode,
				items:[/*{
					text:'Серии',
					tooltip:'Создание и печать серий штрих-кодов',
					handler:function(){
						this.launchApp('barcodepackagegrid');
					},
					scope:this
				},*/{
					text:'Дубликат',
					tooltip:'Печать дубликата',
					handler:function(btn){
						var win = new App.barcodepackage.DuplicateWindow({
						});
						win.show(btn);
					}
				}]
			},{
				xtype:'buttongroup',
				defaults:{
					xtype:'button',
					scale:'medium'
				},
				hidden:App.settings.strictMode,
				items:[{
					text:'Календарь',
					tooltip:'Управление расписанием врачей',
					handler:function(){
						this.launchApp('doctorscheduler',{closable:true});
					},
					scope:this
				},this.preorderBtn]
			},{
				xtype:'buttongroup',
				defaults:{
					xtype:'button',
					scale:'medium'
				},
				items:[{
					text:'Отчеты',
					tooltip:'',
					handler:function(){
						this.launchApp('reports');
					},
					scope:this
				}]
			},{
				xtype:'buttongroup',
				defaults:{
					xtype:'button',
					scale:'medium'
				},
				hidden:App.settings.strictMode,
				items:[{
					text:'Кассир',
					tooltip:'',
					handler:function(){
						this.launchApp('cashiertab');
					},
					scope:this
				}]
			},{
            	xtype:'buttongroup',
            	items:[{
            		text:'Накладные',
            		scale:'medium',
            		handler:function(){
                    	this.launchApp('invoicegrid');
                    },
                    scope:this  
            	}]
            },{
            	xtype:'buttongroup',
            	items:[{
            		text:'Услуги',
            		scale:'medium',
            		handler:function(){
                    	this.launchApp('servicetreegrid',
                    		{id:'service-tree',
                    		title:"Услуги",
                    		closable:true,
                    		large:true});
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
		App.eventManager.on('visitcreate', this.onVisitCreate, this);
		this.on('afterrender', function(){
/*			Ext.QuickTips.register({
				autoHide:false,
			    target: 'global-search-field',
			    title: 'Новый поиск!',
			    text: 'Вводите поисковый запрос следующего вида:<br><b>фамилия имя отчество дата рождения</b>',
			    width: 300,
			    dismissDelay: 30000 // Hide after 10 seconds hover
			});*/

		});
		
		this.on('destroy', function(){
		    App.eventManager.un('launchapp', this.launchApp, this);
			App.eventManager.un('closeapp', this.closeApp, this);
			App.eventManager.un('visitcreate', this.onVisitCreate, this);
		},this);
	},
	
	closeApp: function(appId) {
		this.mainPanel.remove(appId);
	},
	
	onVisitCreate: function(rs,patientId){
		if (patientId){
			this.mainPanel.setActiveTab(0);
		}
	},
	
	launchApp: function(appId,config, setActive) {
        var app_config = {
            xtype:appId
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
