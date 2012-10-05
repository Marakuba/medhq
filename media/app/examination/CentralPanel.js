Ext.ns('App');
Ext.ns('App.services');
Ext.ns('App.examination');

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

App.ExamCentralPanel = Ext.extend(Ext.Panel, {
	
	initComponent: function(){
		
		this.staffStore = new Ext.data.RESTStore({
			autoSave: false,
			autoLoad : false,
			apiUrl : get_api_url('staff'),
			model: App.models.StaffModel
		});
		
		this.genDocButton = new Ext.Button({
			text:'Пациенты',
			handler:this.openGenDocApp.createDelegate(this, []),
			scope:this
		});
		
		this.genDocGroup = new Ext.ButtonGroup({
	            columns: 2,
	            hidden:true,
	            defaults: {
	                scale: 'medium'
	            },
	            items: [this.genDocButton]
	        }
	    )
		
		this.mainPanel = new App.ExamMainPanel({});
		
		this.cmb = new Ext.form.ComboBox({
    		id:'profile-cmb-exam',
			fieldLabel:'Профиль',
			name:'payment_type',
			store:new Ext.data.ArrayStore({
				fields:['id','title'],
				data: profiles
			}),
			listeners:{
				select: function(c, rec, i){
					var p = rec.data.id;
					window.location.href = '/webapp/setactiveprofile/'+p+'/?redirect_to=/webapp/registry/';
				}
			},
			width:300,
			typeAhead: true,
			triggerAction: 'all',
			valueField:'id',
			displayField:'title',
			mode: 'local',
			forceSelection:true,
			selectOnFocus:true,
			editable:false
    	});
	
		this.cmb.setValue(active_profile);

		config = {
			region:'center',
			border:false,
			layout:'border',
			items:[this.mainPanel],
			tbar:[{
				xtype: 'buttongroup',
//				title: '№ заказа или фамилия',
				padding:5,
				items:[{
					xtype:'gsearchfield',
					emptyText:'№ заказа или фамилия'
					
				}]
			},{
                xtype: 'buttongroup',
//                title: 'Журналы',
//                columns: 3,
                defaults: {
                    scale: 'small'
                },
                items: [{
                    text: 'Заказы',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	this.launchApp('examordergrid');
                    },
                    scope:this
                },{
                    text: 'Старые карты',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	this.launchApp('oldordergrid');
                    },
                    scope:this
                },{
                	text: 'Заключения',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	this.launchApp('conclusion',{staff:App.getApiUrl('position')+'/'+active_profile});
                    },
                    scope:this
                }]
            },{
                xtype: 'buttongroup',
//                title: 'Шаблоны',
                columns: 4,
                defaults: {
                    scale: 'small'
                },
                items: [/*{
                    text: 'Список шаблонов',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	this.launchApp('templateglobalgrid');
                    },
                    scope:this
                },{
                    text: 'Группы',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	this.launchApp('groupgrid');
                    },
                    scope:this
                },*/{
                	text: 'Конструктор шаблонов',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	this.launchApp('editor');
                    },
                    scope:this
                },{
                	text: 'Мои шаблоны',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	this.launchApp('tmparchive');
                    },
                    scope:this
                },{
                	text: 'Корзина',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	this.launchApp('extrash');
                    },
                    scope:this
                },{
                	text: 'Глоссарий',
                    scale:'medium',
                    iconAlign: 'top',
                    handler: function(){
                    	this.launchApp('glosseditor');
                    },
                    scope:this
                }
                ]
            },{
              xtype: 'buttongroup',
//            title: 'Пациенты',
	            columns: 2,
	            defaults: {
	                scale: 'small'
	            },
	            items: [{
                	text:'Расписание',
                	scale:'medium',
                	handler:function(){
                		this.launchApp('doctorscheduler',{
                			closable:true,
                			doctorMode:true,
                			title:'Расписание'
                		});
                	},
                    scope:this
                }]
	        },{
              xtype: 'buttongroup',
	            columns: 2,
	            defaults: {
	                scale: 'small'
	            },
	            items: [{
                	text:'Редактор анкет',
                	scale:'medium',
                	handler:function(){
                		this.launchApp('questionnaire',{
                			closable:true,
                			title:'Редактор анкет'
                		});
                	},
                    scope:this
                }]
	        },this.genDocGroup,'->',
	        {
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
		App.ExamCentralPanel.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('launchapp', this.launchApp, this);
		App.eventManager.on('opentab', this.openTab, this);
		App.eventManager.on('closeapp', this.closeApp, this);
		
		this.on('afterrender', function(){
			//Показать кнопку лечащего врача
			this.staffStore.load({params:{format:'json',id:active_staff},callback:function(records){
				if (records.length){
					this.referral = records[0].data.referral;
					this.referral_type = records[0].data.referral_type;
				} else {
					this.referral = null;
					this.referral_type = null;
				};
				if (this.referral_type == 'л'){
					this.genDocGroup.show();
				}
			},scope:this})
			
		},this);
		
		this.on('destroy', function(){
		    App.eventManager.un('launchapp', this.launchApp, this);
			App.eventManager.un('closeapp', this.closeApp, this); 
			App.eventManager.un('opentab', this.openTab, this);
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
		new_app.on('close',function(app){
			this.closeApp(app)
		},this)
		this.mainPanel.setActiveTab(new_app);
	},
	
	openGenDocApp: function(){
		app_config = {
			xtype:'gendocpanel',
			referral:this.referral,
			referral_type:this.referral_type
		}
		var gen_doc_app = this.mainPanel.add(app_config);
		gen_doc_app.on('close',function(app){
			this.closeApp(app)
		},this)
		this.mainPanel.setActiveTab(gen_doc_app);
	},
	
	openTab: function(panel){
		this.mainPanel.add(panel);
		this.mainPanel.setActiveTab(panel)
	}
});

Ext.reg('examcentralpanel', App.ExamCentralPanel);
