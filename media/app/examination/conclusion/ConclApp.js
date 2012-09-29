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
 			autoScroll:true,
 			margins:'5 5 5 0',
 			layout: 'fit',
// 			title:'Предпросмотр',
 			defaults:{
 				border:false,
 				autoScroll:true
 			},
    		items: [
    		]
		});
		
		this.examGrid = new App.examination.CardGrid({
			staff:this.staff,
			order:this.order,
			border: false,
//			split:true,
			bbar: new Ext.PagingToolbar({
	            pageSize: 30,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),

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
 			border:false,
 			header:false,
 			collapsible:true,
			collapseMode:'mini',
 			width:550,
 			margins:'0 5 0 0',
 			layout: 'fit',
 			defaults:{
 				border:false
 			},
    		items: [
    			this.examGrid
    		]
		});
		
		var config = {
			id:'concl-app',
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
		
		this.on('afterrender',function(){
			if (this.order_id){
				this.examGrid.store.setBaseParam('ordered_service',this.order_id)
			}
			this.examGrid.store.load();
		},this)
	},
	
	onPreview: function(card_id){
		var list = new Ext.Panel({
			autoLoad:String.format('/widget/examination/card/{0}/',card_id),
			autoScroll:true
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