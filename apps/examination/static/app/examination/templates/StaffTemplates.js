Ext.ns('App.examination');

App.examination.StaffTemplates = Ext.extend(Ext.Panel, {
	initComponent : function() {

		this.staff = App.getApiUrl('staff','staff')+ '/' + active_staff;

		this.fieldSetStore = new Ext.data.RESTStore({
			autoSave: false,
			autoLoad : true,
			apiUrl : App.getApiUrl('examination','examfieldset'),
			model: App.models.FieldSet
		});

		this.subSectionStore = new Ext.data.RESTStore({
			autoSave: false,
			autoLoad : true,
			apiUrl : App.getApiUrl('examination','examsubsection'),
			model: App.models.SubSection
		});

		this.contentPanel = new Ext.Panel({
			region:'center',
 			border:false,
 			autoScroll:true,
// 			margins:'5 5 5 0',
 			layout: 'fit',
 			title:'Предпросмотр',
 			defaults:{
 				border:false
 			},
 			style:{
 				borderLeft:"solid 1px #99BBE8"
 			},
    		items: [
    		]
		});

		this.archiveGrid = new App.examination.TmpGrid({
			staff:this.staff,
			border: false,
			split:true,
			editable:true,
			baseParams:{
				base_service__isnull:true
			},
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
					this.editTmp(record);
				},
				edittmp:this.editTmp,
				scope:this
			}
		});

		this.archivePanel = new Ext.Panel({
			region:'west',
 			border:false,
 			collapsible:false,
//			collapseMode:'mini',
 			width:550,
// 			margins:'5 5 5 0',
 			layout: 'fit',
 			defaults:{
 				border:false
 			},
    		items: [
    			this.archiveGrid
    		]
		});

		var config = {
			id:'archive-app',
			closable:true,
			title: 'Мои шаблоны',
			layout: 'border',
     		items: [
				this.archivePanel,
				this.contentPanel
			]
		};

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.StaffTemplates.superclass.initComponent.apply(this, arguments);

		this.on('afterrender',function(){
			this.archiveGrid.store.load();
		},this)
	},

	onPreview: function(tmp_id){
		var url = String.format('/widget/examination/template/{0}/',tmp_id);
		this.contentPanel.load({
			url:url
		});
	},

	editTmp: function(record){
		if(!record){
			console.log('нет записи');
			return false
		}

		this.print_name = record.data.name;

		config = {
			editMode: true,
			tplId:record.data.id,
			closable:true,
			title: record.data.print_name,
			print_name:record.data.print_name,
//			record:record,
			staff:this.staff
		};

		App.eventManager.fireEvent('launchapp', 'templateapp',config);

	}
});

Ext.reg('stafftemplates', App.examination.StaffTemplates);
