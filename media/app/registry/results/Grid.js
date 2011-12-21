Ext.ns('App.results');

App.results.Grid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('laborder')
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'created', allowBlank: false, type:'date'},
		    {name: 'is_completed', allowBlank: false, type:'boolean'},
		    {name: 'is_printed', allowBlank: false, type:'boolean'},
		    {name: 'print_date', allowBlank: false, type:'date'},
		    {name: 'visit_id'},
		    {name: 'barcode'},
		    {name: 'patient_name'},
		    {name: 'laboratory_name'},
		    {name: 'staff_name'}
		]);
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false 
		});
		
		this.store = new Ext.data.Store({
			autoLoad:true,
		    baseParams: {
		    	format:'json',
		    	is_manual:false
		    },
		    paramNames: {
			    start : 'offset',  // The parameter name which specifies the start row
			    limit : 'limit',  // The parameter name which specifies number of rows to return
			    sort : 'sort',    // The parameter name which specifies the column to sort on
			    dir : 'dir'       // The parameter name which specifies the sort direction
			},
		    restful: true,     // <-- This Store is RESTful
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer    // <-- plug a DataWriter into the store just as you would a Reader
		});
		
		
		this.columns =  [
		    /*{
		    	header: "№ заказа", 
		    	width: 8, 
		    	sortable: true, 
		    	dataIndex: 'visit_id'
		    },*/{
		    	header: "№ заказа", 
		    	width: 8, 
		    	sortable: true, 
		    	dataIndex: 'barcode'
		    },{
		    	width: 1, 
		    	sortable: true, 
		    	dataIndex: 'is_completed', 
		    	renderer: function(val) {
		    		flag = val ? 'yes' : 'no';
		    		return "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>"
		    	}
		    },{
		    	header: "Дата", 
		    	width: 10, 
		    	sortable: true, 
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y'), 
		    	editor: new Ext.form.TextField({})
		    },{
		    	width: 30,
		    	sortable: true, 
		    	header:'Напечатано',
		    	dataIndex: 'is_printed', 
		    	renderer: function(val,opts,rec) {
		    		flag = val ? 'yes' : 'no';
		    		time = val ? Ext.util.Format.date(rec.data.print_date, 'd.m.Y H:i') : '';
		    		return "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>&nbsp;&nbsp;&nbsp;" + time
		    	}
		    },/*{
		    	width: 1, 
		    	sortable: true, 
		    	header:'Напечатано',
		    	dataIndex: 'is_printed', 
		    	renderer: function(val) {
		    		flag = val ? 'yes' : 'no';
		    		return "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>"
		    	}
		    },{
		    	header: "Дата/время печати", 
		    	width: 12, 
		    	sortable: true, 
		    	dataIndex: 'print_date',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y') 
		    },*/{
		    	header: "Пациент", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'patient_name'
		    },{
		    	header: "Лаборатория", 
		    	width: 35, 
		    	sortable: true, 
		    	dataIndex: 'laboratory_name'
		    },{
		    	header: "Врач", 
		    	width: 35, 
		    	sortable: true, 
		    	dataIndex: 'staff_name'
		    }
		];		
		
		this.ttb =  new Ext.Toolbar({ 
			items:[{
				xtype:'button',
				iconCls:'silk-printer',
				text:'Печать',
				handler:this.onPrint.createDelegate(this, [])
			},'->','Период',{
				id:'visits-start-date-filter',
				xtype:'datefield',
				format:'d.m.Y',
				name:'start_date',
				listeners: {
					select: function(df, date){
						this.storeFilter('visit__created__gte',date.format('Y-m-d 00:00'));
					},
					scope:this
				}
			},{
				id:'visits-end-date-filter',
				xtype:'datefield',
				format:'d.m.Y',
				name:'end_date',
				listeners: {
					select: function(df, date){
						this.storeFilter('visit__created__lte',date.format('Y-m-d 23:59'));
					},
					scope:this
				}
			},{
				text:'Очистить',
				handler:function(){
					Ext.getCmp('visits-start-date-filter').reset();
					Ext.getCmp('visits-end-date-filter').reset();
					this.storeFilter('visit__created__lte',undefined);
					this.storeFilter('visit__created__gte',undefined);
				},
				scope:this
			},'-'
			]});
		
		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true
			}),
	        tbar:this.ttb,
			listeners: {
				rowdblclick:this.onPrint.createDelegate(this, [])
			},
			bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			viewConfig : {
				forceFit : true,
				emptyText: 'Нет записей'
				//getRowClass : this.applyRowClass
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.results.Grid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		
		this.initToolbar();
	},
	
	storeFilter: function(field, value){
		if(!value) {
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
		var id = this.getSelected().data.id;
		var url = ['/lab/print/results',id,''].join('/');
		window.open(url);
	},

	onGlobalSearch: function(v){
		var s = this.store;
		s.baseParams = { format:'json' };
		s.setBaseParam('search', v);
		s.load();
	},
	
	initToolbar: function(){
		// laboratory
		Ext.Ajax.request({
			url:get_api_url('medstate'),
			method:'GET',
			success:function(resp, opts) {
				this.ttb.add({
					xtype:'tbtext',
					text:'Лаборатория: '
				});
				this.ttb.add({
					xtype:'button',
					enableToggle:true,
					toggleGroup:'ex-place-cls',
					text:'Все',
					pressed: true,
					handler:this.storeFilter.createDelegate(this,['laboratory'])
				});
				var jsonResponse = Ext.util.JSON.decode(resp.responseText);
				Ext.each(jsonResponse.objects, function(item,i){
					this.ttb.add({
						xtype:'button',
						enableToggle:true,
						toggleGroup:'ex-place-cls',
						text:item.name,
						handler:this.storeFilter.createDelegate(this,['laboratory',item.id])
					});
				}, this);
				//this.ttb.addSeparator();
				//this.ttb.add();
				//this.ttb.add()
				this.ttb.doLayout();
			},
			scope:this
		});
	}
	
});



Ext.reg('resultsgrid',App.results.Grid);