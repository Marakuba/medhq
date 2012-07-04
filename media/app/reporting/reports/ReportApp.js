Ext.ns('App.reporting','App.dict');

App.reporting.ReportApp = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.fields = ['start_date','end_date'];
		
		this.printBtn = new Ext.Button({
    		text:'Печать',
    		iconCls:'silk-printer',
    		handler:this.onPrint.createDelegate(this,[]),
    		scope:this
    	});
    	
    	this.filtersPanel = new App.reporting.FilterPanel({
    		region:'center',
    		border:true,
 			margins:'5 5 5 0'
    	})
		
		this.contentPanel = new Ext.Panel({
			region:'center',
 			border:true,
 			margins:'5 5 5 0',
 			layout: 'fit',
// 			title:'Предпросмотр',
 			defaults:{
 				border:false
 			},
    		items: [
    		],
    		tbar:[this.printBtn]
		});
		
		this.tree = new App.dict.ReportTree({
			collapsible:true,
			collapseMode:'mini',
			rootVisible:false,
 			width:550,
 			region:'west',
 			margins:'0 5 0 0',
 			border:false,
			fn:function(node){
				this.node = node;
				Ext.callback(this.fn, this.scope || window, [node]);
			},
			listeners:{
				scope:this,
				dblclick:this.onPreview,
				click:this.openReport
			},
			scope:this
		});
		
		this.refreshBtn = new Ext.Button({
			text:'Обновить',
			iconCls:'silk-printer',
			handler:function(){
				var rootNode = this.tree.getRootNode()
        		this.tree.loader.load(rootNode);
        		rootNode.expand();
        	},
        	scope:this
		});
		
		this.printBtn = new Ext.Button({
			text:'Сформировать отчет',
			iconCls:'silk-printer',
			handler:this.onPreview.createDelegate(this,[]),
        	scope:this
		});
		
		this.clearBtn = new Ext.Button({
			text:'Очистить форму',
			handler:this.onClearForm.createDelegate(this,[]),
        	scope:this
		})
		
		this.treePanel = new Ext.Panel({
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
    			this.tree
    		]
		});
		
		var config = {
			id:'concl-app',
			closable:false,
			title: 'Панель отчетов',
			layout: 'border',	
     		items: [
				this.tree,
				this.filtersPanel
			],
			tbar:[
				this.refreshBtn,'-',this.printBtn,'->',this.clearBtn
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.reporting.ReportApp.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
//			this.examGrid.store.load();
		},this)
	},
	
	onPreview: function(node){
		var slug = node.attributes.slug;
		
		var params = this.filtersPanel.makeParamStr(this.fields);
		if(params){
			var url = String.format('/old/reporting/{0}/test_print/?{1}',slug,params);
			window.open(url);
		}
		
	},
	
	onClearForm: function(){
		
		this.filtersPanel.onClearForm()
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
		
	},
	
	openReport: function(node){
		this.filtersPanel.showFields(this.fields);
	},
	
	onPrint:function(){}
});

Ext.reg('reports', App.reporting.ReportApp);