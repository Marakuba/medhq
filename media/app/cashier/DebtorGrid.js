Ext.ns('App','App.cashier');

App.cashier.DebtorGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoLoad : true,
			apiUrl : get_api_url('debtor'),
			model: [
				    {name: 'id'},
				    {name: 'resource_uri'},
				    {name: 'first_name', allowBlank: false},
				    {name: 'mid_name'},
				    {name: 'last_name', allowBlank: false},
				    {name: 'gender', allowBlank: false},
				    {name: 'mobile_phone'},
				    {name: 'home_address_street'},
				    {name: 'email'},
				    {name: 'birth_day', allowBlank: false, type:'date'},
				    {name: 'discount'},
				    {name: 'client_item'},
				    {name: 'balance'},
				    {name: 'initial_account'},
				    {name: 'billed_account'},
				    {name: 'doc'},
				    {name: 'hid_card'}
				]
		});
		
		this.columns =  [
		    {
		    	header: "Фамилия", 
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'last_name'
		    },{
		    	header: "Имя", 
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'first_name'
		    },{
		    	header: "Отчество", 
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'mid_name'
		    },{
		    	header: "Баланс", 
		    	width: 35, 
		    	sortable: true, 
		    	dataIndex: 'balance'
		    }
		];		
		this.payButton = new Ext.Button({
			iconCls:'silk-add',
			text:'Погасить долг',
			disabled:true,
			handler:this.onPay.createDelegate(this),
			scope:this
		});
		this.ttb = new Ext.Toolbar({
			items:[this.payButton]
		});
		
		
		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border: false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true,
				listeners: {
                    rowselect: function(sm, row, rec) {
                    	//this.fireEvent('patientselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().loadRecord(rec);
                    	this.btnSetDisabled(false);
                    },
                    rowdeselect: function(sm, row, rec) {
                    	//this.fireEvent('patientdeselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().reset();
                    	this.btnSetDisabled(true);
                    },
                    scope:this
                }
			}),
			tbar:this.ttb,
	        bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Записи {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			viewConfig : {
				forceFit : true
				//getRowClass : this.applyRowClass
			}	
			//listeners: {
			//	rowdblclick:this.onPatientEdit.createDelegate(this),
			//	scope:this
			//}
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.cashier.DebtorGrid.superclass.initComponent.apply(this, arguments);
		//App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		App.eventManager.on('paymentsave', this.reloadStore, this);
		App.eventManager.on('visitcreate', this.reloadStore, this);
		this.on('destroy', function(){
		    App.eventManager.un('paymentsave', this.reloadStore, this);
			App.eventManager.un('visitcreate', this.reloadStore, this); 
		},this);
//		App.eventManager.on('patientwrite', this.onPatientWrite, this);
		//this.on('patientselect', this.onPatientSelect, this);
		//this.store.on('write', this.onStoreWrite, this);
	},
	
	onPatientSelect: function(){
//		this.btnSetDisable(false);
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	getAbsoluteUrl: function(id) {
		return "/admin/patient/patient/"+id+"/";
	},
	
	goToSlug: function(slug) {
		var s = this.getSelected().data.id;
		var url = this.getAbsoluteUrl(s)+slug+"/";
		window.open(url);
	},
	
	onGlobalSearch: function(v){
		var s = this.store;
		s.baseParams = { format:'json' };
		vi = parseInt(v);
		if (!isNaN(vi)){
			s.setBaseParam('visit_id', vi);
		} else {
			s.setBaseParam('search', v);
		}
		s.load();
	},
	
	onPay: function(){
		var record = this.getSelected();
		if (record) {
			this.win = new App.billing.PaymentWindow({
				is_income : true,
				amount:Math.abs(record.data.balance),
				patientRecord:record
			});
			this.win.show();
		}
	},
	
	reloadStore: function(record){
		if (this.store) {
			this.store.load();
			this.btnSetDisabled(true);
		}
	},
	
	btnSetDisabled: function(status) {
        this.payButton.setDisabled(status);
        //this.cardButton.setDisabled(status);
        //this.contractButton.setDisabled(status);
	}
	
	
	
});



Ext.reg('debtorgrid', App.cashier.DebtorGrid);