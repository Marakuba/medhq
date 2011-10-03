Ext.ns('App','App.registry');

App.registry.PreorderGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		var today = new Date();
		
		this.store = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : false,
			apiUrl : get_api_url('extpreorder'),
			model: App.models.preorderModel
		});
		
		this.columns =  [
		    {
		    	header: "Пациент", 
		    	width: 60, 
		    	sortable: true, 
		    	dataIndex: 'patient_name',
		    	hide: this.patient ? true : false
		    },{
		    	header: "Услуга", 
		    	width: 70, 
		    	sortable: true, 
		    	dataIndex: 'service_name'
		    },{
		    	header: "Цена", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'price'
		    },{
		    	header: "Время", 
		    	width: 35, 
		    	sortable: true, 
		    	dataIndex: 'start',
		    	renderer:Ext.util.Format.dateRenderer('H:i / d.m.Y')
		    },{
		    	header: "Телефон", 
		    	width: 35, 
		    	sortable: false, 
		    	dataIndex: 'patient_phone'
		    }
		];		
		
		this.visitButton = new Ext.Button({
			iconCls:'silk-add',
			disabled:true,
			text:'Оформить заказ',
			handler:this.onVisitAdd.createDelegate(this, []),
			scope:this
		});
		
		var config = {
			id:'preorder-grid',
			title:'Предзаказы',
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
                    	this.fireEvent('serviceselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().loadRecord(rec);
                    	this.btnSetDisabled(false);
                    },
                    rowdeselect: function(sm, row, rec) {
                    	this.fireEvent('serviceselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().reset();
                    	this.btnSetDisabled(true);
                    },
                    scope:this
                }
			}),
			tbar:[this.visitButton],
	        bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Записи {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			viewConfig : {
				forceFit : true,
				getRowClass: function(record, index) {
            		var service = record.get('service');
            		var visit = record.get('visit');
            		var today = new Date();
            		var actual = (record.data.start.getDate() >= today.getDate()) 
            		if (visit) {
                		return 'preorder-visited-row-body';
            		};
            		if (service && actual) {
                		return 'preorder-actual-row-body';
            		};
            		return 'preorder-deactive-row-body';
        		}
			},	
			listeners: {
//				rowdblclick:this.onVisit.createDelegate(this, []),
//				scope:this
			}
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.registry.PreorderGrid.superclass.initComponent.apply(this, arguments);
//		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
//		App.eventManager.on('patientwrite', this.onPatientWrite, this);
		this.on('serviceselect', this.onServiceSelect, this);
		this.on('afterrender', function(){this.store.load()}, this);
		//this.store.on('write', this.onStoreWrite, this);
	},
	
	btnSetDisabled: function(status) {
        this.visitButton.setDisabled(status);
	},
	
	onServiceSelect: function(){
//		this.btnSetDisable(false);
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	onVisitAdd: function() {
        var record = this.getSelectionModel().getSelected();
        if (record.data.service && !record.data.visit) {
        	Ext.callback(this.fn, this.scope || window, [record]);
        };
    }
	
});



Ext.reg('preordergrid', App.registry.PreorderGrid);