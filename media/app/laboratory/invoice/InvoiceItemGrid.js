Ext.ns('App.invoice');

App.invoice.InvoiceItemGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : false,
			apiUrl : get_api_url('invoiceitem'),
			model: [
			    {name: 'id'},
			    {name: 'resource_uri'},
			    {name: 'invoice'},
			    {name: 'ordered_service'},
			    {name: 'created', type:'date',format:'c'},
			    {name: 'barcode'},
			    {name: 'patient_name'},
			    {name: 'service_name'},
			    {name: 'sampling'}
			]
		});
		
		this.serviceStore = new Ext.data.RESTStore({
			autoLoad : false,
			baseParams: {
				sampling__isnull:false
			},
			apiUrl : get_api_url('samplingservice'),
			model: [
			    {name: 'id'},
			    {name: 'resource_uri'},
			    {name: 'created', type:'date',format:'c'},
			    {name: 'barcode'},
			    {name: 'patient_name'},
			    {name: 'service_name'},
			    {name: 'sampling'}
			]
		});
		
		this.columns =  [
		    {
		    	header: "Дата",
		    	width:20,
		    	sortable: true, 
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y')
		    },{
		    	header: "Заказ", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'barcode'
		    },{
		    	header: "Пациент", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'patient_name'
		    },{
		    	header: "Исследование", 
		    	width: 25, 
		    	sortable: true, 
		    	dataIndex: 'service_name'
		    },{
		    	header: "Пробирка", 
		    	width: 25, 
		    	sortable: true, 
		    	dataIndex: 'sampling'
		    }
		];		
		

		
		var config = {
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
			/*tbar: [{
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
	        }),*/
			listeners: {
	        	scope:this
			},
			view : new Ext.grid.GridView({
				forceFit : true,
				emptyText: 'Нет записей'
			})
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.invoice.InvoiceItemGrid.superclass.initComponent.apply(this, arguments);
//		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		this.store.on('write', this.onStoreWrite, this);
	},
	
	pullItems: function(){
		var s = this.store;
		this.serviceStore.load({
			params:{
				sampling__isnull:false
			},
			callback: function(r, opts, success){
				var Item = s.recordType;
				Ext.each(r, function(item,i){
					s.add(new Item({
						created:item.data.created,
						service_name:item.data.service_name,
						patient_name:item.data.patient_name,
						barcode:item.data.barcode,
						sampling:item.data.sampling
					}));
				}, this);
			},
			scope:this
		})
		
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
	
	onStoreWrite: function(store, action, result, res, rs) {
	}
	
});



Ext.reg('invoiceitemgrid', App.invoice.InvoiceItemGrid);