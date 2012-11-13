Ext.ns('App.reporting','Ext.ux.form');

App.reporting.ReportPanel = Ext.extend(Ext.TabPanel, {

	initComponent: function(){

		this.filterPanel = new App.reporting.FilterPanel({
			title:'Поля'
    	});

    	this.reportEditor = App.reporting.ReportEditor({
    		title:'Настройка'
    	});

    	this.reportStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : true,
			apiUrl : App.utils.getApiUrl('reporting','report'),
			model: [
				{name: 'id'},
			    {name: 'resource_uri'},
			    {name: 'sql_query_text'},
			    {name: 'verbose'},
				{name: 'slug'},
			    {name: 'name'},
			    {name: 'template'},
			    {name: 'is_active'}
			]
		});
		config = {
			region:'center',
			margins:'5 0 5 5',
			items:[this.filterPanel]
		},


		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.reporting.ReportPanel.superclass.initComponent.apply(this, arguments);

		this.on('afterrender',function(){
			this.setActiveTab(0)
		},this)

	},

	makeParamStr: function(fields){
		return this.filterPanel.makeParamStr(fields)
	},

	onClearForm: function(){
		this.filterPanel.onClearForm()
	},

	showFields: function(fields){
		this.filterPanel.showFields(fields)
	},

	loadReport: function(report_id){
		this.reportStore.setBaseParam('id',report_id)
		this.reportStore.load({callback:function(records){
			if (!records.length) return false;
			this.report = records[0];
		},scope:this})
	}

});

Ext.reg('reportpanel',App.reporting.ReportPanel);
