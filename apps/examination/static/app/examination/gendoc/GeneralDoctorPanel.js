Ext.ns('App.examination');
Ext.ns('App.patient');
Ext.ns('Ext.ux');

App.examination.GeneralDoctorPanel = Ext.extend(Ext.Panel, {
	
    initComponent: function() {
    	
    	this.patientCard = new App.examination.PatientCard({
    		region:'center',
//    		layout:'fit',
    		referral:this.referral,
    		referral_type:this.referral_type
    	})
    	
    	this.patientGrid = new App.examination.PatientGrid({
    		region:'west',
    		width:400,
    		listeners:{
    			scope:this,
    			patientselect:function(record){
    				this.patientCard.enable();
    				this.patientCard.setActivePatient(record);
    			}
    		}
    	});
    	 
    	config = {
    		id:'general-doctor-panel',
    		closable:true,
			title:'Лечащий врач',
			layout: 'border',
			border: false,
			items:[
				this.patientGrid,
				{
					xtype:'panel',
					region:'center',
					layout:'fit',
					border:false,
					items:this.patientCard
				}
			]
    	};
    	
    	Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.GeneralDoctorPanel.superclass.initComponent.apply(this, arguments);
		
		WebApp.on('globalsearch', this.onGlobalSearch, this);
		this.on('destroy', function(){
			WebApp.un('globalsearch', this.onGlobalSearch, this);
		},this);
    },
    
    onGlobalSearch : function(v) {
		this.patientCard.disable();
	}
});

Ext.reg('gendocpanel', App.examination.GeneralDoctorPanel);