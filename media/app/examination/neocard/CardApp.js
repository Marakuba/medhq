Ext.ns('App.examination');
Ext.ns('App.ServicePanel','App.ux.tree');
Ext.ns('Ext.ux');

App.examination.CardApp = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.tmpStore = new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : false,
			apiUrl : get_api_url('examtemplate'),
			model: App.models.Template
		});
		
		this.fieldSetStore = new Ext.data.RESTStore({
			autoSave: false,
			autoLoad : true,
			apiUrl : get_api_url('examfieldset'),
			model: App.models.FieldSet
		});
		
		this.subSectionStore = new Ext.data.RESTStore({
			autoSave: false,
			autoLoad : true,
			apiUrl : get_api_url('examsubsection'),
			model: App.models.SubSection
		});
		
		this.patientPanel = new App.examination.PatientHistoryPanel ({
			region:'west',
			width:250,
			border: false,
			collapsible:true,
			collapseMode:'mini',
			split:true
		});
		
		this.contentPanel = new Ext.Panel({
			region:'center',
 			border:true,
 			margins:'5 5 5 0',
 			layout: 'fit',
 			title:'Выберите действие',
 			defaults:{
 				border:false
 			},
    		items: [
    		]
		});
		
		var config = {
			id: 'neocard-cmp',
			closable:true,
			title: 'Конструктор',
			layout: 'border',	
     		items: [
				this.patientPanel,
				this.contentPanel
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.CardApp.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
			this.startPanel = this.newStartPanel({
				service:this.service,
				staff:this.staff
			});
			this.contentPanel.add(this.startPanel);
		},this);
		
	},
	
	newCardBody: function(config){
		return new App.examination.TemplateBody (Ext.apply(
			{
				base_service : this.service,
				fieldSetStore : this.fieldSetStore,
				subSectionStore : this.subSectionStore,
				title:'Заголовок',
				listeners:{
					movearhcivetmp:function(){
						this.onServiceClick(this.attrs)
					},
					deletetmp:function(){
						this.onServiceClick(this.attrs)
					},
					changetitle: function(text){
						this.contentPanel.setTitle(text);
					},
					scope:this
				}
			},
			config)
		);
	},
	
	newStartPanel: function(config){
		var startPanel = new App.examination.CardStartPanel(config);
		
		startPanel.on('opentmp',function(source){
			this.contentPanel.removeAll(true);
			if (!source){
				this.record = new this.tmpStore.model();
				this.record.set('print_name',this.print_name);
			} else {
				this.record = new this.tmpStore.recordType(source.data);
				if (!this.record.data.print_name){
					this.record.set('print_name',this.print_name);
				};
				delete this.record.data['id'];
			};
			this.record.set('base_service',this.base_service);
			this.record.set('staff',this.staff);
			this.tmpStore.add(this.record);
			this.tmpBody = this.newTmpBody({
				print_name:this.record.data.print_name ? this.record.data.print_name: this.print_name,
				record:this.record,
				base_service:this.service
			});
			this.contentPanel.setTitle(this.tmpBody.print_name);
			this.contentPanel.add(this.tmpBody);
			this.contentPanel.doLayout();
		},this);
		
		return startPanel;
	}
});


Ext.reg('neocard', App.examination.CardApp);
