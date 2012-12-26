Ext.ns('App.patient');

App.patient.PatientCard = Ext.extend(Ext.TabPanel, {
	
	initComponent:function(){

		if(window.PatientCard){
			this.items = _.map(window.PatientCard, function(card){
				var item = {
					xtype:card[0]
				};
				Ext.apply(item, card[1]);
				return item;
			});
		}
		
		// this.cards = [];
		/*App.settings.strictMode ? [{
			title:'Приемы',
			layout:'fit',
			xtype:'patientvisitgrid'
		},{
			title:'Результаты',
			layout:'fit',
			xtype:'patientlabgrid'
		},{
			title:'Оказанные услуги',
			layout:'fit',
			xtype:'patientservicegrid'
		}] : [{
			title:'Приемы',
			layout:'fit',
			xtype:'patientvisitgrid'
		},{
			title:'Результаты',
			layout:'fit',
			medstateStore:this.medstateStore,
			xtype:'patientlabgrid'
		},{
			title:'Исследования',
			layout:'fit',
			xtype:'patientmanualgrid'
		},{
			title:'Назначения',
			hasPatient:true,
			medstateStore:this.medstateStore,
			xtype:'preordermanager'
		},{
			title:'Оказанные услуги',
			layout:'fit',
			xtype:'patientservicegrid'
		},{
			title:'Карты осмотра',
			layout:'fit',
			xtype:'regexamgrid'
		},{
			title:'Старые карты*',
			layout:'fit',
			xtype:'regoldexamgrid'
		},{
			title:'Оплаты',
			layout:'fit',
			hasPatient:true,
			xtype:'paymentgrid'
		}];*/
		
		config = {
//			closable:true,
			border:false,
        	defaults: {
				border:false
			},
			enableTabScroll:true,
			header:true,
//	        disabled:true,
    		activeTab:0,
			// items:this.cards
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.PatientCard.superclass.initComponent.apply(this, arguments);
		
		WebApp.on('globalsearch', this.onGlobalSearch, this); //
		this.on('afterrender',function(){
			this.doRefresh();
		},this);
		this.on('destroy', function(){
			WebApp.un('globalsearch', this.onGlobalSearch, this); //
		},this);
	},
	
	onGlobalSearch: function() {
//		this.disable();
	},
	
	titleTpl : new Ext.Template(
		'Пациент: {last_name} {first_name} {mid_name}'
	),
	
	setActivePatient: function(rec) {
		this.record = rec;
		this.setTitle(this.titleTpl.apply(this.record.data));
//		this.enable();
		this.items.each(function(item,i){
			if(item.setActivePatient) {
				item.setActivePatient(rec);
			}
		});
	},
	
	doRefresh : function() {
		if(this.record) {
			this.setActivePatient(this.record);
		}
	},
	
	
});

Ext.reg('patientcard', App.patient.PatientCard);