Ext.ns('App','App.registry');

App.registry.PreorderManager = Ext.extend(Ext.TabPanel, {

	initComponent : function() {

		this.preorderTitle = 'Ближайшие';

		this.completedTitle = 'Выполненные';

		this.asgmtTitle = 'Направления';

		this.medstateStore = this.medstateStore || new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : true,
			apiUrl : App.getApiUrl('state','state','medstate'),
			model: App.models.MedState
		});

		this.patientStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : false,
			apiUrl : App.getApiUrl('patient','patient'),
			model: App.models.patientModel
		});


		var preorderCfg =  {
			title:this.preorderTitle,
			hasPatient:this.hasPatient,
			patientStore: this.patientStore,
			medstateStore: this.medstateStore,
			searchValue: this.searchValue,
			doctorMode: this.doctorMode,
			listeners:{
				scope:this,
				setupdating:this.setUpdating
			}
		};
		Ext.apply(preorderCfg,this.preorderCfg);
		this.preorderTab = new App.registry.PreorderGrid(preorderCfg);
		this.completedTab = new App.registry.PreorderGrid({
			hasPatient:this.hasPatient,
			completed:true,
			medstateStore: this.medstateStore,
			patientStore: this.patientStore,
			searchValue: this.searchValue,
			doctorMode: this.doctorMode,
			title:this.completedTitle,
			baseParams:{
				format:'json',
				'timeslot__isnull':false,
				'visit__isnull':false
			},
			listeners:{
				scope:this,
				setupdating:this.setUpdating
			}
		});
		var assignmentCfg = {
			hasPatient:this.hasPatient,
			title:this.asgmtTitle,
			medstateStore: this.medstateStore,
			patientStore: this.patientStore,
			searchValue: this.searchValue,
			doctorMode: this.doctorMode,
			referral:this.referral,
			referral_type:this.referral_type,
			listeners:{
				scope:this,
				setupdating:this.setUpdating
			}
		};
		Ext.apply(assignmentCfg,this.assignmentCfg);
		this.assignmentTab = new App.patient.AsgmtGrid(assignmentCfg);

		this.preorderTab.getStore().on('load',this.onPreorderLoad,this);
		this.completedTab.getStore().on('load',this.onCompletedLoad,this);
		this.assignmentTab.getStore().on('load',this.onAsgmtLoad,this);

		config = {
			id:this.hasPatient? Ext.id() : 'preorder-manager',
			title:'Предзаказы',
			tabPosition:'bottom',
			items:[
				this.preorderTab,
				this.completedTab,
				this.assignmentTab

			]

		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.registry.PreorderManager.superclass.initComponent.apply(this, arguments);
		this.on('afterrender', function(){
			this.setActiveTab(this[this.openTab] || 0);
			if(!this.hasPatient){
				this.task = Ext.TaskMgr.start({
	                run: this.updateInfo.createDelegate(this),
	                interval: 30000
	            });
			}
//			this.assignmentTab.store.load();
		},this);

		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		this.on('destroy', function(){
			App.eventManager.un('globalsearch', this.onGlobalSearch, this);
		},this);

		this.on('beforedestroy',function(){
			if(!this.hasPatient){
				Ext.TaskMgr.stop(this.task)
			}
		},this)
	},

	onPreorderLoad : function(store,r,options){
		if(this.changeTitle){
			this.preorderTab.setTitle(String.format('{0} ({1})', this.preorderTitle, store.getTotalCount()));
		}
	},

	onCompletedLoad : function(store,r,options){
		if(this.changeTitle){
			this.completedTab.setTitle(String.format('{0} ({1})', this.completedTitle, store.getTotalCount()));
		}
	},

	onAsgmtLoad : function(store,r,options){
		if(this.changeTitle){
			this.assignmentTab.setTitle(String.format('{0} ({1})', this.asgmtTitle, store.getTotalCount()));
		}
	},

	onGlobalSearch : function(v) {
		this.changeTitle = v!==undefined;
		if(!v){
			this.preorderTab.setTitle(this.preorderTitle);
			this.completedTab.setTitle(this.completedTitle);
			this.assignmentTab.setTitle(this.asgmtTitle);
		}
	},

	updateInfo: function(){
		var tab = this.getActiveTab();
		if(tab.updateInfo)	{
			tab.updateInfo();
		}
	},

	setUpdating: function(tab,status){
		Ext.each(this.items.items,function(item){
			if (item != tab && item.updateInfo) item.setUpdating(status);
		},this)
	},

	btnSetDisabled: function(status) {
        this.visitButton.setDisabled(status);
        this.clearButton.setDisabled(status);
	},

	setActivePatient: function(rec) {
		this.assignmentTab.setActivePatient(rec);
		this.preorderTab.store.setBaseParam('patient',rec.id)
		this.preorderTab.store.load();
		this.completedTab.store.setBaseParam('patient',rec.id);
		this.completedTab.store.load();
	}

});

Ext.reg('preordermanager', App.registry.PreorderManager);
