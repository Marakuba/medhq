Ext.ns('App.billing');

App.billing.PaymentGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.tmp_id = Ext.id();
		
		this.backend = App.getBackend('payment');
		
		this.store = this.backend.store;
		
		this.addButton = new Ext.SplitButton({
   			text: 'Добавить',
   			handler: this.onCreate.createDelegate(this,[true]), 
   			menu: new Ext.menu.Menu({
        		items: [
	    		    {text: 'Приходный', handler: this.onCreate.createDelegate(this,[true])},
	    		    {text: 'Расходный', handler: this.onCreate.createDelegate(this,[false])}	    		    	    		    
        		]
   			})
		});
		
		this.columns =  [
		    {
		    	header: "Номер",
		    	width:15,
		    	sortable: true, 
		    	dataIndex: 'id'
		    },{
		    	header: "Дата",
		    	width:20,
		    	sortable: true, 
		    	dataIndex: 'doc_date',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y')
		    },{
		    	header: "Документ", 
		    	width: 20, 
		    	sortable: true, 
		    	renderer: function(v,params,rec){
		    		if (rec.data.income === true) {
		    			return 'Приходный ордер'
		    		} else {
		    			return 'Расходный ордер'
		    		}
		    	}
		    },{
		    	header: "Клиент",
		    	width:60,
		    	sortable: true, 
		    	dataIndex: 'client_name'
		    },{
		    	header: "Лицевой счет", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'account_id'
		    	/*renderer: function(v,params,rec){
                    var result = rec.data.account_id;
                    return result
		    	}*/
		    },{
		    	header: "Сумма", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'amount'
		    }
		];		
		
		this.ttb = new Ext.Toolbar({ 
			items:[this.addButton,
			{
				iconCls:'silk-pencil',
				text:'Изменить',
	        	handler:this.onChange.createDelegate(this),
	        	scope:this
			},'-',
			{	xtype:'button',
				enableToggle:true,
				toggleGroup:'document-type',
				text:'Приходный ордер',
                scope:this,
			    handler: function(){
                    this.store.filter('income',"true")
                }
		    },{	xtype:'button',
				enableToggle:true,
				toggleGroup:'document-type',
				text:'Расходный ордер',
                scope:this,
			    handler: function(){
                    this.store.filter('income',"false")
                }
		    },{
				xtype:'button',
				enableToggle:true,
				toggleGroup:'document-type',
				text:'Все',
				pressed: true,
                scope:this,
				handler: function(){
                    this.store.clearFilter()
                }
		    },'-','Период c ',{
                                xtype:'datefield',
                                id: 'date_gte'+this.tmp_id,
                                format:'d.m.Y',
                                listeners: {
                                        select: function(df, date){
                                                this.storeFilter('doc_date__gte',date.format('Y-m-d'));
                                        },
                                        scope:this
                                }
                        },' по ',{
                                xtype:'datefield',
                                id: 'date_lte'+this.tmp_id,
                                format:'d.m.Y',
                                listeners: {
                                        select: function(df, date){
                                                this.storeFilter('doc_date__lte',date.format('Y-m-d'));
                                        },
                                        scope:this
                                }
                        },'-',
			'->']
		}); 
		
		var config = {
			id:'payment-grid',
			title:'Платежные документы',
			closable:true,
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
			/*bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),*/
			listeners: {
				rowdblclick:this.onChange.createDelegate(this),
	        	scope:this
			},
			view : new Ext.grid.GridView({
				forceFit : true,
				emptyText: 'Нет записей'
				//getRowClass : this.applyRowClass
			})
			
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.billing.PaymentGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);

		
		this.on('afterrender', function(){
			var first_day = new Date();
			first_day.setDate(1);
			Ext.getCmp('date_gte'+this.tmp_id).setValue(first_day);
			this.store.setBaseParam('doc_date__gte', first_day.format('Y-m-d'));
			this.store.load();
		}, this);
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
	
	onCreate: function(type) {
		var data = {
			is_income : type,
			model:this.backend.getModel(),
			scope:this,
			fn:function(record){
				this.backend.saveRecord(record);
			}
		};
        App.eventManager.fireEvent('openform','paymentform',data)
	},
	
	onChange: function(rowindex){
		var record = this.getSelected();
		if(record) {
    		var data = {
    			is_income:true,
    			record:record,
                title: record.data.name,
    			model:this.backend.getModel(),
    			scope:this,
    			fn:function(record){
    				this.backend.saveRecord(record);
    			}
    		};
        App.eventManager.fireEvent('openform','paymentform',data)
		}
	},
	
	onDelete: function() {
		
	}
	
});



Ext.reg('paymentgrid',App.billing.PaymentGrid);
