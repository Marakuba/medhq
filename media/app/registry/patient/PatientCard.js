Ext.ns('App.patient');
Ext.ns('App.billing');

App.patient.PatientCard = Ext.extend(Ext.TabPanel, {
	
	initComponent:function(){
		
		this.cards = App.settings.strictMode ? [{
			title:'Приемы',
			layout:'fit',
			xtype:'patientvisitgrid'
		},{
			title:'Результаты',
			layout:'fit',
			xtype:'patientlabgrid'
		},{
			title:'Исследования',
			layout:'fit',
			xtype:'patientmanualgrid'
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
			xtype:'patientlabgrid'
		},{
			title:'Исследования',
			layout:'fit',
			xtype:'patientmanualgrid'
		},{
			title:'Назначения',
//			layout:'fit',
			hasPatient:true,
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
			title:'Оплаты',
			layout:'fit',
			hasPatient:true,
			xtype:'paymentgrid'
		}];
		
		config = {
			closable:true,
			border:false,
        	defaults: {
				border:false
			},
			enableTabScroll:true,
			header:true,
	        disabled:true,
    		activeTab:0,
			items:this.cards
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.PatientCard.superclass.initComponent.apply(this, arguments);
		
		App.eventManager.on('globalsearch', this.onGlobalSearch, this); //
		App.eventManager.on('visitclose', this.onVisitClose, this); //
		App.eventManager.on('refundclose', this.onVisitClose, this); //
		this.on('afterrender',function(){
			this.doRefresh();
		},this);
		this.on('destroy', function(){
			App.eventManager.un('globalsearch', this.onGlobalSearch, this); //
			App.eventManager.un('visitclose', this.onVisitClose, this); //
			App.eventManager.un('refundclose', this.onVisitClose, this); //
		},this);
	},
	
	onGlobalSearch: function() {
		this.disable();
	},
	
	titleTpl : new Ext.Template(
		'Пациент: {last_name} {first_name} {mid_name}'
	),
	
	setActivePatient: function(rec) {
		this.record = rec;
		this.setTitle(this.titleTpl.apply(this.record.data));
		this.enable();
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
	
	onVisitClose: function() {
		if (this.record) {
//			this.setActivePatient(this.record);
		} else {
		}
	}
	
});

Ext.reg('patientcard', App.patient.PatientCard);