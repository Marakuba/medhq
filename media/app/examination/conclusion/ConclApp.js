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
			split:true,
			listeners:{
				rowselect:function(record){
					if (record){
						this.onPreview(record.data.id);
					}
				},
				rowdblclick:function(grid,rowIndex,e){
					var record = grid.getSelectionModel().getSelected();
					if (!record || record.data.executed){
						return false
					}
					this.print_name = record.data.name;
					this.editCard(record);
				},
				scope:this
			}
		});
		
		this.conclPanel = new Ext.Panel({
			region:'west',
 			border:true,
 			collapsible:true,
			collapseMode:'mini',
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
		this.contentPanel.setTitle('Предпросмотр');
		this.contentPanel.doLayout();
		this.doLayout();
	},
	
	editCard: function(record){
		
		config = {
			closable:true,
    		patient:record.data.patient_id,
    		patient_name: record.data.patient_name,
    		ordered_service:record.data.ordered_service,
			title: 'Пациент ' + record.data.patient_name,
			print_name:record.data.service_name,
			record:record,
			staff:this.staff
		};
		
		App.eventManager.fireEvent('launchapp', 'neocard',config);
		
	}
});

Ext.reg('conclusion', App.examination.ConclApp);