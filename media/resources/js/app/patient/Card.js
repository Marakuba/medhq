Ext.ns('App');

App.PatientCard = Ext.extend(Ext.Panel, {
	
	
	
	initComponent:function(){

		config = {
			id:'patient-card',
        	defaults: {
				border:false
			},
	        title:'Пациент:',
			header:true,
	        layout:'fit',
	        disabled:true,
        	items: new Ext.TabPanel({
        		id:'patient-card-tabs',
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
				}/*,{
					title:'Информация',
					layout:'fit',
					xtype:'patientinfo'
				}*/]
        	})
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.PatientCard.superclass.initComponent.apply(this, arguments);
		
		var i = this.items.itemAt(0).items; 
		//console.log(i);
		this.visitGrid = i.itemAt(0);
		this.labGrid = i.itemAt(1);
		this.serviceGrid = i.itemAt(2);

		//App.eventManager.on('patientselect', this.onPatientSelect, this); //
		this.addEvents({patientselect:true});
		App.eventManager.on('visitclose', this.onVisitClose, this); //
		
		this.on('destroy', function(){
		    App.eventManager.un('visitclose', this.onVisitClose, this); 
		},this);
	},
	
	setActivePatient: function(rec) {
		//var p = Ext.getCmp('patient-grid');
		//var rec = p.store.getById(id);
		this.record = rec;
		titles = ["Пациент:",rec.data.last_name,rec.data.first_name,rec.data.mid_name];
		this.setTitle(titles.join(" "));
		this.enable();
		//this.fireEvent('patientselect', rec.id);
		this.visitGrid.setActivePatient(rec.id);
		this.labGrid.setActivePatient(rec.id);
		this.serviceGrid.setActivePatient(rec.id);
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

Ext.reg('patientcard', App.PatientCard);