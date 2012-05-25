Ext.ns('App','App.registry');

App.registry.PatientPreorderGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = this.store || new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : false,
			apiUrl : get_api_url('extpreorder'),
			model: App.models.preorderModel
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
		    	header: "Место выполнения", 
		    	width: 40, 
		    	sortable: true, 
		    	dataIndex: 'execution_place_name'
		    },{
		    	header: "Цена", 
		    	width: 30, 
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
				singleSelect : false,
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
				getRowClass: function(record, index, p, store) {
            		var service = record.get('service');
            		var visit = record.get('visit');
            		var today = new Date();
            		if (record.data.start){
            			var start_date = record.data.start.clone(); 
            			var actual = start_date.clearTime() >= today.clearTime();
            		} else {
            			var actual = true;
            		}
            		if (record.data.comment){
            			p.body = '<p class="helpdesk-row-body"> Комментарий: '+record.data.comment+'</p>';
            		};
            		if (visit) {
                		return 'preorder-visited-row-body';
            		};
            		if (!actual) {
                		return 'preorder-deactive-row-body';
            		};
            		if (!(state == record.data.execution_place) && record.data.service) {
            			return 'preorder-other-place-row-body';
            		};
            		if (actual) {
                		return 'preorder-actual-row-body';
            		};
            		return 'preorder-deactive-row-body';
        		}
			},	
			listeners: {
				rowdblclick:this.onChoice.createDelegate(this, []),
				scope:this
			}
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.registry.PatientPreorderGrid.superclass.initComponent.apply(this, arguments);
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
        var records = this.getSelectionModel().getSelections();
        if (records.length) {
        	var only_one = true;
        	var patient = records[0].data.patient
        	Ext.each(records,function(rec){
	        	if (rec.data.patient != patient){
	        		only_one = false
	        		return
	        	}
	        });
        	
	        if (!only_one){
	        	Ext.Msg.alert('Ошибка!','Выбрано несколько пациентов!');
	        	return
	        }
	        
        	var recs = new Array();
        	Ext.each(records, function(record){
    	    	if (!record.data.patient){
    	    		Ext.Msg.alert('Ошибка!','Не указан пациент!');
    	    		return
    	    	};
    	    	if ( state!=record.data.execution_place && record.data.service && App.settings.serviceTreeOnlyOwn){
    	    		Ext.Msg.alert('Ошибка!',String.format('Вы не можете работать с этой организацией: {0}!', record.data.execution_place_name));
    	    		return
    	    	};
        		if(!record.data.visit) {
        			recs.push(record);
        		}
        	}, this);
        	if (recs.length){
        		Ext.callback(this.fn, this.scope || window, [recs]);
	    		
        	}
        } else {
        	Ext.Msg.alert('Уведомление','Не выбран ни один предзаказ')
        }
        
    }
	
});



Ext.reg('patientpreordergrid', App.registry.PatientPreorderGrid);