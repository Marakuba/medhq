Ext.ns('App.invoice');

App.invoice.InvoiceGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoLoad : true,
			apiUrl : get_api_url('invoice'),
			model: [
			    {name: 'id'},
			    {name: 'resource_uri'},
			    {name: 'created', type:'date',format:'c'},
			    {name: 'state'},
			    {name: 'state_name'},
			    {name: 'operator_name'}
			]
		});
		
		this.columns =  [
		    {
		    	header: "№",
		    	width:8,
		    	sortable: true, 
		    	dataIndex: 'id',
		    },{
		    	header: "Дата",
		    	width:20,
		    	sortable: true, 
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y')
		    },{
		    	header: "Лаборатория", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'state_name'
		    },{
		    	header: "Оператор", 
		    	width: 25, 
		    	sortable: true, 
		    	dataIndex: 'operator_name'
		    }
		];		
		

		
		var config = {
			closable:true,
			title:'Накладные',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			stripeRows:true,
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true,
				listeners:{
					rowselect:function(sm,i,rec) {
					},
					rowdeselect:function(sm,i,rec) {
					},
					scope:this
				}
			}),
			tbar: [{
				text:'Создать',
				iconCls:'silk-add',
				handler:this.onCreate.createDelegate(this),
				scope:this
			},{
				text:'Изменить',
				iconCls:'silk-pencil',
				handler:this.onChange.createDelegate(this),
				scope:this
			},{
				text:'Реестр исследований',
				handler:this.onPrint.createDelegate(this),
				scope:this
			},{
				text:'Реестр пробирок',
				handler:this.onPrint.createDelegate(this),
				scope:this
			}],
			bbar: new Ext.PagingToolbar({
	            pageSize: 100,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			listeners: {
				rowdblclick:this.onChange.createDelegate(this),
	        	scope:this
			},
			view : new Ext.grid.GridView({
				forceFit : true,
				emptyText: 'Нет записей'
			})
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.invoice.InvoiceGrid.superclass.initComponent.apply(this, arguments);
//		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		this.store.on('write', this.onStoreWrite, this);
	},
	
	onGlobalSearch: function(v) {
		this.storeFilter('search', v);
	},
	
	storeFilter: function(field, value){
		if(value===undefined) {
			delete this.store.baseParams[field]
		} else {
			this.store.setBaseParam(field, value);
		}
		this.store.load();
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	onPrint: function() {
//		var id = this.getSelected().data.id;
//		var url = ['/lab/print/results',id,''].join('/');
//		window.open(url);
	},
	
	onCreate: function() {
//		this.win = new App.issue.IssueWindow({
//			model:this.store.recordType,
//			scope:this,
//			fn:function(record){
//				this.store.insertRecord(record);
//			}
//		});
//		this.win.show();
		App.eventManager.fireEvent('launchapp','invoicetab',{
		});
	},
	
	onChange: function(rowindex){
		var record = this.getSelected();
		if(record) {
    		this.win = new App.issue.IssueWindow({
    			record:record,
    			model:this.store.recordType,
    			scope:this,
    			fn:function(record){
    				//this.store.Record(record);
    			}
    		});
    		this.win.show();
		}
	},
	
	onDelete: function() {
		
	},
	
	onStoreWrite: function(store, action, result, res, rs) {
	}
	
});



Ext.reg('invoicegrid', App.invoice.InvoiceGrid);