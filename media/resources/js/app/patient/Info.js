Ext.ns('App');

App.PatientInfo = Ext.extend(Ext.Panel, {
	
	
	
	initComponent:function(){

		config = {
			id:'patient-info',
        	defaults: {
				border:false
			},
	        title:'Информация',
			header:true,
	        layout:'fit',
        	tpl:new Ext.Template.from('patient-info', {}),
        	html:'Информация о пациенте'
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.PatientInfo.superclass.initComponent.apply(this, arguments);
		
		App.eventManager.on('patientselect', this.onPatientSelect, this); //
		
		this.on('destroy', function(){
		    App.eventManager.un('patientselect', this.onPatientSelect, this);
		});
		
	},
	
	setActivePatient: function(rec) {
		this.record = rec;
	}
	
	
});

Ext.reg('patientinfo', App.PatientInfo);