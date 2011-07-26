Ext.ns('App.patient');

App.patient.PatientCard = Ext.extend(Ext.TabPanel, {
	
	
	
	initComponent:function(){
		
		config = {
			border:false,
        	defaults: {
				border:false
			},
			header:true,
//	        layout:'fit',
	        disabled:true,
    		activeTab:0,
			items:[{
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
			},{
				title:'Карты осмотра',
				layout:'fit',
				xtype:'regexamgrid'
			}/*,{
				title:'Возвраты',
				layout:'fit',
				xtype:'patientrefundgrid'
			},{
				title:'Информация',
				layout:'fit',
				xtype:'patientinfo'
			}*/]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.PatientCard.superclass.initComponent.apply(this, arguments);
		
		App.eventManager.on('globalsearch', this.onGlobalSearch, this); //
		App.eventManager.on('visitclose', this.onVisitClose, this); //
		App.eventManager.on('refundclose', this.onVisitClose, this); //
	},
	
	onGlobalSearch: function() {
		this.disable();
	},
	
	setActivePatient: function(rec) {
		this.record = rec;
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
			//console.log(this.record);
			this.setActivePatient(this.record);
		} else {
			//console.log('record undefined');
		}
	}
	
});

Ext.reg('patientcard', App.patient.PatientCard);