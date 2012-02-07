Ext.ns('App','App.registry');

App.registry.PreorderManager = Ext.extend(Ext.TabPanel, {

	initComponent : function() {
		
		this.medstateStore = new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : true,
			apiUrl : get_api_url('medstate'),
			model: App.models.MedState
		});
		
		
		this.preorderTab = new App.registry.PreorderGrid({
			title:'Ближайшие предзаказы',
			hasPatient:this.hasPatient,
			medstateStore: this.medstateStore
		});
		this.assigmentTab = new App.patient.AsgmtGrid({
			hasPatient:this.hasPatient,
			medstateStore: this.medstateStore
		});
		this.completedTab = new App.registry.PreorderGrid({
			hasPatient:this.hasPatient,
			medstateStore: this.medstateStore,
			title:'Выполненные предзаказы',
			baseParams:{
				format:'json',
				'timeslot__isnull':false,
				'visit__isnull':false
			}
		});
		
		config = {
			id:'preorder-manager',
			title:'Предзаказы',
			items:[
				this.preorderTab,
				this.assigmentTab,
				this.completedTab
			]
			
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.registry.PreorderManager.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		this.on('afterrender', function(){
			this.setActiveTab(this[this.openTab] || 0);
			this.assigmentTab.store.load();
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