Ext.ns('App');

App.Patients = Ext.extend(Ext.Panel, {
	initComponent:function(){

		config = {
			title:'Пациенты',
			layout:'border',
            defaults: {
				border:false
			},
			items:[{
				id:'patient-card',
				region:'center',
				xtype:'patientcard'
			},{
				region:'west',
				width:'30%',
				split:true,
				//border:false,
				layout:'border',
				items:[{
					id:'patient-grid',
					region:'center',
					xtype:'patientgrid'
				},{
					id:'patient-quick-form',
					region:'south',
					xtype:'quickform'
				}]
			}]
		}
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.Patients.superclass.initComponent.apply(this, arguments);
		
		this.patientGrid = Ext.getCmp('patient-grid');
		this.patientCard = Ext.getCmp('patient-card');
		
		this.patientGrid.on('patientselect', this.patientSelect, this);

	},
	
	patientSelect: function(rec){
		this.patientCard.setActivePatient(rec);
	}
});

Ext.reg('patients', App.Patients);