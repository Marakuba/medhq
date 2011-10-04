Ext.ns('App','App.registry');

App.registry.PreorderGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.start_date = new Date();
		
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
		    	header: "Врач", 
		    	width: 70, 
		    	sortable: true, 
		    	dataIndex: 'staff_name'
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
		
		this.startDateField = new Ext.form.DateField({
			format:'d.m.Y',
			value:this.start_date,
			listeners: {
				select: function(df, date){
					this.start_date = date;
					this.storeFilter('timeslot__start__range',String.format('{0},{1}',this.start_date.format('Y-m-d 00:00'),this.start_date.format('Y-m-d 23:59')));
				},
				scope:this
			}
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
	        bbar: {
            	cls: 'ext-cal-toolbar',
            	border: true,
            	buttonAlign: 'center',
            	items: [{
//	                id: this.id + '-tb-prev',
                	handler: this.onPrevClick,
                	scope: this,
                	iconCls: 'x-tbar-page-prev'
            	},this.startDateField,{
//	                id: this.id + '-tb-next',
                	handler: this.onNextClick,
                	scope: this,
                	iconCls: 'x-tbar-page-next'
            	}]
        	},
			viewConfig : {
				forceFit : true,
				getRowClass: function(record, index) {
            		var service = record.get('service');
            		var visit = record.get('visit');
            		var today = new Date();
            		var actual = record.data.start.clearTime() >= today.clearTime();
            		if (visit) {
                		return 'preorder-visited-row-body';
            		};
            		if (!(service == undefined) && actual) {
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
		this.on('afterrender', function(){
			this.store.setBaseParam('timeslot__start__range',String.format('{0},{1}',this.start_date.format('Y-m-d 00:00'),this.start_date.format('Y-m-d 23:59')))
			this.store.load()}, 
		this);
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
    },
    
    storeFilter: function(field, value){
		if(!value) {
			delete this.store.baseParams[field]
		} else {
			this.store.setBaseParam(field, value);
		}
		this.store.load();
	},
	
	onPrevClick: function(){
		this.start_date = this.start_date.add(Date.DAY,-1);
		this.startDateField.setValue(this.start_date);
		this.storeFilter('timeslot__start__range',String.format('{0},{1}',this.start_date.format('Y-m-d 00:00'),this.start_date.format('Y-m-d 23:59')));
	},
	
	onNextClick: function(){
		this.start_date = this.start_date.add(Date.DAY,1);
		this.startDateField.setValue(this.start_date);
		this.storeFilter('timeslot__start__range',String.format('{0},{1}',this.start_date.format('Y-m-d 00:00'),this.start_date.format('Y-m-d 23:59')));
	}
});



Ext.reg('preordergrid', App.registry.PreorderGrid);