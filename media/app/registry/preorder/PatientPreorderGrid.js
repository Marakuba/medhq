Ext.ns('App','App.registry');

App.registry.PatientPreorderGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : false,
			apiUrl : get_api_url('extpreorder'),
			model: [
					{name: 'id'},
				    {name: 'resource_uri'},
				    {name: 'patient'},
				    {name: 'patient_name'},
				    {name: 'timeslot'},
				    {name: 'comment'},
				    {name: 'service'},
				    {name: 'service_name'},
				    {name: 'price'},
				    {name: 'staff'},
				    {name: 'staff_name'},
				    {name: 'execution_place'},
				    {name: 'start', type: 'date',format:'c'}
				]
		});
		
		this.columns =  [
		    {
		    	header: "Пациент", 
		    	width: 45, 
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
		    	width: 70, 
		    	sortable: true, 
		    	dataIndex: 'price'
		    },{
		    	header: "Время", 
		    	width: 35, 
		    	sortable: true, 
		    	dataIndex: 'start',
		    	renderer:Ext.util.Format.dateRenderer('H:i / d.m.Y')
		    }
		];		
		
		this.choiceButton = new Ext.Button({
			iconCls:'silk-accept',
			disabled:true,
			text:'Выбрать',
			handler:this.onChoice.createDelegate(this, []),
			scope:this
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
			tbar:[this.choiceButton],
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
            		var c = record.get('service');
            		
            		if (c) {
                		return 'helpdesk-row-body';
            		};
        		}
			},	
			listeners: {
				rowdblclick:this.onChoice.createDelegate(this, []),
				scope:this
			}
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.registry.PatientPreorderGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
//		App.eventManager.on('patientwrite', this.onPatientWrite, this);
		this.on('serviceselect', this.onServiceSelect, this);
		this.on('afterrender', function(){this.store.load()}, this);
		//this.store.on('write', this.onStoreWrite, this);
	},
	
	btnSetDisabled: function(status) {
        this.choiceButton.setDisabled(status);
	},
	
	onServiceSelect: function(){
//		this.btnSetDisable(false);
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	onChoice: function() {
        var record = this.getSelectionModel().getSelected();
        if (record.data.service) {
        	Ext.callback(this.fn, this.scope || window, [record]);
        };
    }
	
});



Ext.reg('patientpreordergrid', App.registry.PatientPreorderGrid);