Ext.ns('App.examination');

App.examination.ConclApp = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
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
		
		this.contentPanel = new Ext.Panel({
			region:'center',
 			border:true,
 			margins:'5 5 5 0',
 			layout: 'fit',
 			title:'Предпросмотр',
 			defaults:{
 				border:false
 			},
    		items: [
    		]
		});
		
		this.examGrid = new App.examination.ConclGrid({
			staff:this.staff,
			border: false,
			collapsible:true,
			collapseMode:'mini',
			split:true,
			listeners:{
				rowclick:function(grid,rowIndex,e){
					var record = grid.getSelectionModel().getSelected();
					if (record){
						this.onPreview(record.data.id);
					}
				},
				rowdblclick:function(grid,rowIndex,e){
					var record = grid.getSelectionModel().getSelected();
					this.print_name = record.data.name;
					this.contentPanel.removeAll(true);
					this.contentPanel.setTitle(record.data.print_name);
					this.cardBody = this.newCardBody({
						print_name: record.data.print_name,
						record:record,
						card:true // признак того, что это карта
					});
					this.contentPanel.add(this.cardBody);
					this.contentPanel.doLayout();
				},
				scope:this
			}
		});
		
		this.conclPanel = new Ext.Panel({
			region:'west',
 			border:true,
 			width:550,
 			margins:'5 5 5 0',
 			layout: 'fit',
 			defaults:{
 				border:false
 			},
    		items: [
    			this.examGrid
    		]
		});
		
		var config = {
			closable:true,
			title: 'Журнал заключений',
			layout: 'border',	
     		items: [
				this.conclPanel,
				this.contentPanel
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.ConclApp.superclass.initComponent.apply(this, arguments);
	},
	
	onPreview: function(card_id){
		var list = new Ext.Panel({
			autoLoad:String.format('/widget/examination/card/{0}/',card_id)
		});
		this.contentPanel.removeAll();
		this.contentPanel.add(list);
		this.contentPanel.doLayout();
		this.doLayout();
	},
	
	newCardBody: function(config){
		
		this.generalTab = new App.examination.CardGeneralTab({
			print_name:config.print_name,
			record:config.record
		});
		
		return new App.examination.TemplateBody (Ext.apply(
			{
				fieldSetStore : this.fieldSetStore,
				subSectionStore : this.subSectionStore,
				generalTab: this.generalTab,
				patient:this.patient, // для открытия истории пациента
				isCard:true,
				staff:this.staff,
				title:'Заголовок',
				listeners:{
					changetitle: function(text){
						this.contentPanel.setTitle(text);
					},
					scope:this
				}
			},
			config)
		);
	},
});

Ext.reg('conclusion', App.examination.ConclApp);