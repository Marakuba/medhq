Ext.ns('App');
Ext.ns('App.services');

App.StatusBar = new Ext.ux.StatusBar({
	defaultText: 'Готово',
	defaultIconCls: 'x-status-valid',
	autoClear:3000,
	items:[String.format('{0}, {1}', active_user, active_state)]
}); 

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
//				title: '№ заказа или фамилия',
				padding:5,
				items:[{
					xtype:'gsearchfield',
					stripCharsRe:new RegExp('[\;\?]')
				}]
			},{
				xtype:'buttongroup',
//				title:'Регистратура',
				defaults:{
					xtype:'button',
					scale:'medium'
				},
				items:[/*{
					xtype:'splitbutton',
//					text:'Новый пациент',
					iconCls:'silk-add',
					tooltip:'Создание нового пациента',
					handler:function(){
						var win = new App.patient.PatientWindow({
							inCard:true,
							scope:this,
							fn:function(record){
//								this.store.insertRecord(record);
							}
						});
						win.show();
					},
					scope:this,
					menu:[{
						iconCls:'med-usersetup',
						text:'Журнал пациентов',
						tooltip:'Журнал всех пациентов',
						handler:function(){
							this.launchApp('patients');
						},
						scope:this
					}]
				},*/{
					text:'Приемы',
					tooltip:'Журнал приемов пациентов',
					handler:function(){
						this.launchApp('visits');
					},
					scope:this
				}]
			},{
				xtype:'buttongroup',
//				title:'Результаты',
				defaults:{
					xtype:'button',
					scale:'medium'
				},
				items:[{
//					iconCls:'med-testtubes',
					text:'Результаты',
					tooltip:'Журнал результатов анализов',
					handler:function(){
						this.launchApp('results');
					},
					scope:this
				}]
			/*},{
				xtype:'buttongroup',
//				title:'Штрих-коды',
				defaults:{
					xtype:'button',
					scale:'medium'
				},
				items:[{
					text:'Серии',
					tooltip:'Создание и печать серий штрих-кодов'
				},{
					text:'Дубликат',
					tooltip:'Печать дубликата'
				}]*/
			},{
				xtype:'buttongroup',
//				title:'Календарь',
				defaults:{
					xtype:'button',
					scale:'medium'
				},
				items:[{
					text:'Календарь',
					tooltip:'Управление расписанием врачей',
					handler:function(){
						this.launchApp('preordergrid');
					},
					scope:this
				},{
					text:'Предзаказы',
					tooltip:'Управление предзаказами',
					handler:function(){
						this.launchApp('preordergrid');
					},
					scope:this
				}]
			},{
				xtype:'buttongroup',
//				title:'Отчеты',
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
				//title:'Касса',
				defaults:{
					xtype:'button',
					scale:'medium'
				},
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
            },'->',{
				xtype:'buttongroup',
//				title:'HelpDesk',
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
			},{
				xtype:'buttongroup',
//				title:'Профиль',
				defaults:{
					xtype:'button',
					scale:'medium'
				},
				items:[{
					iconCls:'silk-cog',
					menu:[new Ext.form.ComboBox({
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
						editable:false,
						value:active_profile
				    })]
				},{
	            	text:'Выход',
	            	handler:function(){
	            		window.location.href = '/webapp/logout/';
	            	}
	            }]
			}],
	        bbar: App.StatusBar
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.CentralPanel.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('launchapp', this.launchApp, this);
		App.eventManager.on('closeapp', this.closeApp, this);
	},
	
	closeApp: function(appId) {
		this.mainPanel.remove(appId);
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
