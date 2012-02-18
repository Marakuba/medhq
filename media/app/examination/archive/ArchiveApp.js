Ext.ns('App.examination');

App.examination.ArchiveApp = Ext.extend(Ext.Panel, {
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
		
		this.archiveGrid = new App.examination.ArchiveGrid({
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
					if (!record){
						return false
					}
					this.print_name = record.data.name;
					this.editTmp(record);
				},
				scope:this
			}
		});
		
		this.archivePanel = new Ext.Panel({
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
    			this.archiveGrid
    		]
		});
		
		var config = {
			closable:true,
			title: 'Журнал заключений',
			layout: 'border',	
     		items: [
				this.archivePanel,
				this.contentPanel
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.ConclApp.superclass.initComponent.apply(this, arguments);
	},
	
	onPreview: function(tmp_id){
		var list = new Ext.Panel({
			autoLoad:String.format('/widget/examination/template/{0}/',tmp_id)
		});
		this.contentPanel.removeAll();
		this.contentPanel.add(list);
		this.contentPanel.setTitle('Предпросмотр');
		this.contentPanel.doLayout();
		this.doLayout();
	},
	
	editTmp: function(record){
		
		config = {
			editMode: true,
			closable:true,
			title: record.data.print_name,
			print_name:record.data.print_name,
			record:record,
			staff:this.staff
		};
		
		App.eventManager.fireEvent('launchapp', 'editor',config);
		
	}
});

Ext.reg('tmparchive', App.examination.ArchiveApp);