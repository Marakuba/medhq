Ext.ns('App.patient');

App.patient.ClientAccountGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		this.clientHidden = this.clientHidden==undefined ? false : this.clientHidden;
		//this.backend = new App.clientaccount.Backend({});
		this.addButton = new Ext.Button({
			iconCls:'silk-add',
			text:'Добавить',
	        handler:this.onCreate.createDelegate(this),
	        disabled: true,
	        scope:this
		});
		
		this.store = new Ext.data.Store({
			//autoLoad:true,
			
			autoSave:false,
		    baseParams: {
		    	format:'json'
		    },
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
		    restful: true,
		    proxy: new Ext.data.HttpProxy({
			    url: get_api_url('clientaccount')
			}),
		    reader: new Ext.data.JsonReader({
			    totalProperty: 'meta.total_count',
			    successProperty: 'success',
			    idProperty: 'id',
			    root: 'objects',
			    messageProperty: 'message'
			}, [
    		    {name: 'id'},
    		    {name: 'resource_uri'},
                {name: 'client_item', allowBlank: true},
                {name: 'client_name', allowBlank: true},
                {name: 'account_id', allowBlank: true},
                {name: 'account', allowBlank: true},
                {name: 'amount', allowBlank: true}
			]),
		    writer: new Ext.data.JsonWriter({
			    encode: false,
			    writeAllFields: true
			}),
		    listeners:{
		    	exception:function(proxy, type, action, options, response, arg){
		    		console.log('ClientAccount Grid Exception!');
		    		console.log(proxy);
		    		console.log(type);
		    		console.log(action);
		    		console.log(options);
		    		console.log(response);
		    		console.log(arg);
		    	},
		    	write:function(store, action, result, res, rs){
		    		console.log('ClietnAccount created!');
		    		console.log(store);
		    		console.log(action);
		    		console.log(result);
		    		console.log(res);
		    		console.log(rs);
		    	},
		    	scope:this
		    }
		});
		
		if (this.record) {
			var client_item_id = App.uriToId(this.record.data.client_item);
			this.store.setBaseParam('client_item',client_item_id);
			this.store.load();
		}
		
		this.columns =  [
		    {
		    	header: "Пациент",
		    	width:'50%',
		    	sortable: true,
		    	hidden: this.clientHidden,
		    	dataIndex: 'client_name'
		    },{
		    	header: "Лицевой счет",
		    	width:'25%',
		    	sortable: true, 
		    	dataIndex: 'account_id'
		    },{
		    	header: "Баланс", 
		    	xtype:'numbercolumn',
		    	width: '25%', 
		    	sortable: true, 
		    	dataIndex: 'amount'
		    }
		];		
		
		this.ttb = new Ext.Toolbar({ 
			items:[this.addButton,'->']
		}); 
		
		var config = {
			title:'Лицевые счета',
			//closable:true,
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			stripeRows:true,
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true
			}),
	        tbar:this.ttb,
			bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),			
			view : new Ext.grid.GridView({
				forceFit : true,
				emptyText: 'Нет записей'
				//getRowClass : this.applyRowClass
			})
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.ClientAccountGrid.superclass.initComponent.apply(this, arguments);
		//App.eventManager.on('globalsearch', this.onGlobalSearch, this);
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
		this.fireEvent('newitem');
		/*var data = {
			model:this.backend.getModel(),
			scope:this,
            title:'Лицевой счет',
			fn:function(record){
				this.backend.saveRecord(record);
			}
		};
        App.eventManager.fireEvent('openform','clientaccountcreate',data)*/
	},
	
	onChange: function(rowindex){
	/*	var record = this.getSelected();
		if(record) {
    		var data = {
    			record:record,
                title: record.data.name,
    			model:this.backend.getModel(),
    			scope:this,
    			fn:function(record){
    				this.backend.saveRecord(record);
    			}
    		};
        App.eventManager.fireEvent('openform','clientaccountcreate',data)
		}*/
	},
	
	onDelete: function() {
		
	},
	
	getSteps: function(){
		var steps = 0;
		var m = this.store.getModifiedRecords().length;
		var d = this.deletedRecords ? this.deletedRecords.length : 0;
		steps+=m;
		steps+=d;
		return steps;
	},
	
	onPatientCreate: function(record) {
		this.record = record;
		this.onSave();
	}
	
});



Ext.reg('clientaccountgrid',App.patient.ClientAccountGrid);
