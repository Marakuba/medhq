Ext.ns('App','App.registry');

App.registry.PreorderManager = Ext.extend(Ext.TabPanel, {

	initComponent : function() {
		
		this.medstateStore = this.medstateStore || new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : true,
			apiUrl : get_api_url('medstate'),
			model: App.models.MedState
		});
		
		this.patientStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : false,
			apiUrl : get_api_url('patient'),
			model: App.models.patientModel
		});
		
		this.preorderTab = new App.registry.PreorderGrid({
			title:'Ближайшие',
			hasPatient:this.hasPatient,
			patientStore: this.patientStore,
			medstateStore: this.medstateStore,
			searchValue: this.searchValue
		});
		this.completedTab = new App.registry.PreorderGrid({
			hasPatient:this.hasPatient,
			completed:true,
			medstateStore: this.medstateStore,
			patientStore: this.patientStore,
			searchValue: this.searchValue,
			title:'Выполненные',
			baseParams:{
				format:'json',
				'timeslot__isnull':false,
				'visit__isnull':false
			}
		});
		this.assigmentTab = new App.patient.AsgmtGrid({
			hasPatient:this.hasPatient,
			medstateStore: this.medstateStore,
			patientStore: this.patientStore,
			searchValue: this.searchValue
		});
		
		config = {
			id:this.hasPatient? Ext.id() : 'preorder-manager',
			title:'Предзаказы',
			tabPosition:'bottom',
			items:[
				this.preorderTab,
				this.completedTab,
				this.assigmentTab
				
			]
			
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.registry.PreorderManager.superclass.initComponent.apply(this, arguments);
		this.on('afterrender', function(){
			this.setActiveTab(this[this.openTab] || 0);
//			this.assigmentTab.store.load();
		},this);
	},

	btnSetDisabled: function(status) {
        this.visitButton.setDisabled(status);
        this.clearButton.setDisabled(status);
	},
	
	setActivePatient: function(rec) {
		this.assigmentTab.setActivePatient(rec);
		this.preorderTab.store.setBaseParam('patient',rec.id)
		this.preorderTab.store.load();
		this.completedTab.store.setBaseParam('patient',rec.id);
		this.completedTab.store.load();
	}
	
});



Ext.reg('preordermanager', App.registry.PreorderManager);