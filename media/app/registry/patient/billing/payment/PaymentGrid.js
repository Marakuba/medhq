Ext.ns('App.billing');

App.billing.PaymentGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoLoad:false,
		    apiUrl : get_api_url('payment'),
		    model: App.models.paymentModel
		});
		
		this.addButton = new Ext.SplitButton({
   			text: 'Добавить',
   			handler: this.onCreate.createDelegate(this,['1']), 
   			menu: new Ext.menu.Menu({
        		items: [
	    		    {text: 'Приходный', handler: this.onCreate.createDelegate(this,['1'])},
	    		    {text: 'Расходный', handler: this.onCreate.createDelegate(this,['2'])}	    		    	    		    
        		]
   			})
		});
		
		this.gteDateField = new Ext.form.DateField({
            format:'d.m.Y',
            listeners: {
                    select: function(df, date){
                            this.storeFilter('doc_date__gte',date.format('Y-m-d'));
                    },
                    scope:this
            }
        });
        
        this.lteDateField = new Ext.form.DateField({
            format:'d.m.Y',
            listeners: {
                    select: function(df, date){
                            this.storeFilter('doc_date__lte',date.format('Y-m-d'));
                    },
                    scope:this
            }
        })
		
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
		    		if (rec.data.direction == '1') {
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
		    	//hidden:true
		    },{
		    	header: "Лицевой счет", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'account_id',
		    	hidden:true
		    	/*renderer: function(v,params,rec){
                    var result = rec.data.account_id;
                    return result
		    	}*/
		    },{
		    	header: "Сумма", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'amount'
		    },{
		    	header: "Примечание", 
		    	width: 70, 
		    	sortable: true, 
		    	dataIndex: 'comment'
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
				text:'Приходные ордеры',
                scope:this,
			    handler: function(){
                    this.store.filter('direction',"1")
                }
		    },{	xtype:'button',
				enableToggle:true,
				toggleGroup:'document-type',
				text:'Расходные ордеры',
                scope:this,
			    handler: function(){
                    this.store.filter('direction',"2")
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
		    },'-','Период c ',this.gteDateField,' по ',this.lteDateField,'-',
			'->']
		}); 
		
		var config = {
//			id:'payment-grid',
			title:'Платежные документы',
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
		App.eventManager.on('paymentsave', this.onPaymentSave, this);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);

		
		this.on('afterrender', function(){
			if (!this.hasPatient){
				var first_day = new Date();
				first_day.setDate(1);
				this.gteDateField.setValue(first_day);
				this.store.setBaseParam('doc_date__gte', first_day.format('Y-m-d'));
				this.store.load();
			}
		}, this);
		
		this.on('destroy', function(){
		    App.eventManager.un('paymentsave', this.onPaymentSave, this);
		    App.eventManager.un('globalsearch', this.onGlobalSearch, this);
		},this);
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
	
	
	onCreate: function(type){
		//if (this.patientRecord) {
			this.win = new App.billing.PaymentWindow({
				store:this.store,
				is_income : type == '1' ? true : false,
				patientRecord:this.patientRecord
			});
			this.win.show();
		//}
	},
	
	onChange: function(rowindex){
			var rec = this.getSelected();
			if(rec) {
    			var data = {
    				is_income:rec.data.direction == 1 ? true : false,
	    			record:rec,
	    			patientRecord:this.patientRecord,
	    			patient_id:rec.data.client,
	    			store:this.store
    			};
    			this.win = new App.billing.PaymentWindow(data);
    			this.win.show();
		}
	},
	
	onDelete: function() {
		
	},
	
	setActivePatient: function(rec) {
		id = rec.id;
		this.patientId = id;
		this.patientRecord = rec;
		var s = this.store;
		s.baseParams = {format:'json','client_account__client_item__client': id};
		s.load();
	},
	
	onPaymentSave: function(record){
		if (this.hasPatient){
			App.eventManager.fireEvent('balanceupdate')
		}
		if (this.store) {
			this.store.load();
			//this.btnSetDisabled(true);
		};
		if(this.win){
			this.win.close();
		}
	}
	
});



Ext.reg('paymentgrid',App.billing.PaymentGrid);
