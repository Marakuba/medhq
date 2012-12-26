Ext.ns('App.examination');
Ext.ns('App.patient');
Ext.ns('Ext.ux');

App.examination.PatientGridPanel = Ext.extend(Ext.Panel, {
	
    initComponent: function() {
    	this.patientGrid = new App.examination.PatientGrid();
    	config = {
    		id:'patient-grid-panel',
    		closable:true,
			title:'Пациенты',
			layout: 'fit',
			border: false,
			items:[
				this.patientGrid
			]
    	},
    	Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.PatientGridPanel.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('patientgridpanel', App.examination.PatientGridPanel);