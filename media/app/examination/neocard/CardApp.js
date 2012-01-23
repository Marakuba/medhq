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
		
		this.cardStore = new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : false,
			apiUrl : get_api_url('card'),
			model: App.models.Card
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
			patient:this.patient,
			patient_name:this.patient_name,
			width:450,
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
			closable:true,
			title: 'Карта осмотра',
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
				ordered_service:this.ordered_service,
				staff:this.staff
			});
			this.contentPanel.add(this.startPanel);
		},this);
		
	},
	
	newCardBody: function(config){
		
		this.generalTab = new App.examination.CardGeneralTab({
			print_name:this.print_name
		});
		
		return new App.examination.TemplateBody (Ext.apply(
			{
				fieldSetStore : this.fieldSetStore,
				subSectionStore : this.subSectionStore,
				generalTab: this.generalTab,
				patient:this.patient,
				isCard:true,
				staff:this.staff,
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
				this.record = new this.cardStore.model();
				this.record.set('print_name',this.print_name);
			} else {
				this.record = new this.cardStore.recordType();
				Ext.applyIf(this.record.data,source.data);
				if (!this.record.data.print_name){
					this.record.set('print_name',this.print_name);
				};
				delete this.record.data['id'];
			};
			this.record.set('ordered_service',this.ordered_service);
			this.cardStore.add(this.record);
			this.cardBody = this.newCardBody({
				print_name:this.record.data.print_name ? this.record.data.print_name: this.print_name,
				record:this.record,
				card:true // признак того, что это карта
			});
			this.contentPanel.setTitle(this.cardBody.print_name);
			this.contentPanel.add(this.cardBody);
			this.contentPanel.doLayout();
		},this);
		
		return startPanel;
	}
});


Ext.reg('neocard', App.examination.CardApp);
