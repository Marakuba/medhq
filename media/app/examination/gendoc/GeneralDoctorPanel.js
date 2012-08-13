Ext.ns('App.examination');
Ext.ns('App.patient');
Ext.ns('Ext.ux');

App.examination.GeneralDoctorPanel = Ext.extend(Ext.Panel, {
	
    initComponent: function() {
    	this.staffStore = new Ext.data.RESTStore({
			autoSave: false,
			autoLoad : false,
			apiUrl : get_api_url('staff'),
			model: App.models.StaffModel
		});
    	
    	this.patientGrid = new App.examination.PatientGrid({
    		region:'west',
    		width:400,
    		listeners:{
    			scope:this,
    			patientselect:function(record){
    				this.preorderPanel.setActivePatient(record)
    			}
    		}
    	});
    	this.preorderPanel = new App.registry.PreorderManager({
    		region:'center',
    		hasPatient:true,
    		doctorMode:true
    	}) 
    	config = {
    		id:'general-doctor-panel',
    		closable:true,
			title:'Лечащий врач',
			layout: 'border',
			border: false,
			items:[
				this.patientGrid,
				this.preorderPanel
			]
    	};
    	
    	this.on('afterrender', function(){
			//Показать кнопку Подтвердить для лечащего врача
			this.staffStore.load({params:{format:'json',id:active_staff},callback:function(records){
				if (records.length){
					this.referral = records[0].data.referral;
					this.referral_type = records[0].data.referral_type;
				} else {
					this.referral_type = null;
				};
				this.preorderPanel.setReferral(this.referral,this.referral_type);
			},scope:this})
		},this);
    	Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.GeneralDoctorPanel.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('gendocpanel', App.examination.GeneralDoctorPanel);