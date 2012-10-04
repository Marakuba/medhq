Ext.ns('App.examination');
Ext.ns('App.ServicePanel','App.ux.tree');
Ext.ns('Ext.ux');

App.examination.CardApp = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.tmpStore = new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : false,
			apiUrl : get_api_url('examtemplate'),
			baseParams:{
				format:'json',
				deleted:false
			},
			model: App.models.Template
		});
		
		this.cardStore = new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : false,
			apiUrl : get_api_url('card'),
			baseParams:{
				format:'json',
				deleted:false
			},
			model: App.models.Card
		});
		
		this.cardStore.on('write',function(store, action, result, res, rs){
			if (rs.data.deleted){
				this.destroy();
			}
		},this)
		
		this.fieldSetStore = new Ext.data.RESTStore({
			autoSave: false,
			autoLoad : true,
			apiUrl : get_api_url('examfieldset'),
			model: App.models.FieldSet
		});
		
		this.subSectionStore = new Ext.data.RESTStore({
			autoSave: false,
			autoLoad : false,
			apiUrl : get_api_url('examsubsection'),
			model: App.models.SubSection
		});
		
		
		this.contentPanel = new Ext.Panel({
			region:'center',
 			border:false,
 			margins:'5 5 5 0',
 			layout: 'fit',
// 			title:'Выберите действие',
 			defaults:{
 				border:false
 			},
    		items: [
    		]
		});
	
		var config = {
			closable:true,
//			title: 'Карта осмотра',
			layout: 'border',	
     		items: [
//				this.patientPanel,
				this.contentPanel
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.CardApp.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
			if (this.record){
				//форма карты осмотра открывается быстрее, чем успевает загрузиться store 
				// с разделами и подразделами, поэтому форма будет открываться после загрузки 
				// this.subSectionStore
			}
			else {
				this.startPanel = this.newStartPanel({
					service:this.service,
					ordered_service:this.ordered_service,
					staff:this.staff,
					patient:this.patient
				});
				this.contentPanel.add(this.startPanel);
			}
		},this);
		
		this.fieldSetStore.on('load',function(){
			this.subSectionStore.load()
		},this)
		
		this.subSectionStore.on('load',function(){
			if (this.record){
				this.onEditCard(this.record)
			}
		},this)
		
	},
	
	newCardBody: function(config){
		
		this.generalTab = new App.examination.CardGeneralTab({
			record:config.record,
			fromArchive:config.fromArchive,
			print_name:this.print_name
		});
		
		return new App.examination.TemplateBody (Ext.apply(
			{
				fieldSetStore : this.fieldSetStore,
				subSectionStore : this.subSectionStore,
				generalTab: this.generalTab,
				patient:this.patient, // для открытия истории пациента
				patient_name:this.patient_name,
				isCard:true,
				staff:this.staff,
				title:'Заголовок',
				listeners:{
					movearhcivetmp:function(){
					},
					deleterecord:function(){
//						this.destroy();
					},
					changetitle: function(text){
						this.contentPanel.setTitle(text);
					},
					cardclose:function(){
						this.destroy();
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
				print_name: source ? source.print_name : this.record.data.print_name ? this.record.data.print_name: this.print_name,
				record:this.record,
				card:true // признак того, что это карта
			});
			this.contentPanel.setTitle(this.cardBody.print_name);
			this.contentPanel.add(this.cardBody);
			this.contentPanel.doLayout();
		},this);
		
		startPanel.on('editcard',function(record){
			this.onEditCard(record)
		},this);
		
		startPanel.on('edittmp',function(record){
			this.onEditTmp(record)
		},this);
		
		return startPanel;
	},
	onEditCard: function(record){
		this.contentPanel.removeAll(true); // cardStore из CardStartPanel уничтожены, нужно искать запись теперь в другом store
		this.print_name = record.data.print_name;
		this.cardStore.setBaseParam('id',record.data.id);
		this.cardStore.load({callback:function(records){
			if (records.length){
				this.cardBody = this.newCardBody({
					print_name: records[0].data.print_name,
					record:records[0],
					card:true // признак того, что это карта
				});
				this.contentPanel.setTitle(records[0].data.print_name);
				this.contentPanel.add(this.cardBody);
				this.contentPanel.doLayout();
			}
		},scope:this});
	},
	onEditTmp: function(record){
		this.contentPanel.removeAll(true); // tmpStore из CardStartPanel уничтожен, нужно теперь искать запись в другом store
		this.print_name = record.data.print_name;
		this.tmpStore.setBaseParam('id',record.data.id);
		this.tmpStore.load({callback:function(records){
			if (records.length){
				this.cardBody = this.newCardBody({
					print_name: records[0].data.print_name,
					record:records[0],
					fromArchive:true,
					card:false // признак того, что это не карта
				});
				this.contentPanel.setTitle(records[0].data.print_name);
				this.contentPanel.add(this.cardBody);
				this.contentPanel.doLayout();
			}
		},scope:this});
	}
});


Ext.reg('neocard', App.examination.CardApp);
