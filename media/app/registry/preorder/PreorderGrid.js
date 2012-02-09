Ext.ns('App','App.registry');

App.registry.PreorderGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.start_date = new Date();
		
		this.medstateStore = this.medstateStore || new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : true,
			apiUrl : get_api_url('medstate'),
			model: App.models.MedState
		});

		this.visitButton = new Ext.Button({
			iconCls:'silk-add',
			disabled:true,
			hidden:this.completed ? true : false,
			text:'Оформить заказ',
			handler:this.onVisitButtonClick.createDelegate(this, []),
			scope:this
		});
		
		this.pTypeButton = new Ext.CycleButton({
            showText: true,
            prependText: 'Оплата: ',
            items: [{
                text:'все',
                checked:true,
                filterValue:undefined
            },{
                text:'Наличные',
                filterValue:'н'
            },{
                text:'ДМС',
                filterValue:'д'
            },{
                text:'Безнал',
                filterValue:'б'
            }],
            changeHandler:function(btn, item){
                    this.storeFilter('payment_type',item.filterValue);
            },
            scope:this
        });
        
		this.clearButton = new Ext.Button({
			iconCls:'silk-cancel',
			disabled:true,
			hidden:this.completed ? true : false,
			text:'Отменить предзаказ',
			handler:this.onDelPreorderClick.createDelegate(this, []),
			scope:this
		});
		
		this.ttb = new Ext.Toolbar({
			items:[this.visitButton,this.clearButton,'-',{
				text:'Реестр',
				handler:function(){
					Ext.ux.Printer.print(this);
				},
				scope:this
			},'->',this.pTypeButton]
		});

		this.medstateStore.on('load',function(store,records){
			var stateMenu = []
			stateMenu.push({
				text:'все',
				checked:true,
				filterValue:undefined
			});
			if (records.length){
				Ext.each(records,function(rec){
					stateMenu.push({
						text:rec.data.name,
						filterValue:rec.data.id
					})
				})
			}
			this.stateButton = new Ext.CycleButton({
	            showText: true,
	            prependText: 'Организация: ',
	            items: stateMenu,
	            changeHandler:function(btn, item){
	                    this.storeFilter('service__state',item.filterValue);
	            },
	            scope:this
	        });
	        
	        this.ttb.add(this.stateButton);
	        this.ttb.add({
	        	text:'Обновить',
	        	handler:function(){
	        		this.store.load();
	        	},
	        	scope:this
	        });
	        this.doLayout();
		},this);
		
		this.store = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : true,
			baseParams:this.baseParams ? this.baseParams : {
				format:'json',
				'timeslot__isnull':false
			},
			apiUrl : get_api_url('extpreorder'),
			model: App.models.preorderModel
		});
		
		this.eventModel = new Ext.data.Record.create([
			{name: 'id'},
		    {name: 'resource_uri'},
		    {name: 'vacancy', allowBlank: false}
		]);

		this.eventStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : true,
			apiUrl : get_api_url('event'),
			model: this.eventModel
		});
		this.patientStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : false,
			apiUrl : get_api_url('patient'),
			model: App.models.patientModel
		});
		
		this.columns =  [
		    {
		    	header: "Пациент", 
		    	width: 60, 
		    	sortable: true, 
		    	dataIndex: 'patient_name',
		    	hidden: this.hasPatient ? true : false
		    },{
		    	header: "Услуга", 
		    	width: 100, 
		    	sortable: true, 
		    	dataIndex: 'service_name'
		     },{
		    	header: "Врач", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'staff_name'
		    },{
		    	header: "Цена", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'price'
		    },{
		    	header: "Место выполнения", 
		    	width: 40, 
		    	sortable: true, 
		    	dataIndex: 'execution_place_name'
		    },{
		    	header: "Время", 
		    	width: 35, 
		    	sortable: true, 
		    	dataIndex: 'start',
		    	renderer:Ext.util.Format.dateRenderer('H:i / d.m.Y')
		    },{
		    	header: "Форма оплаты", 
		    	width: 25, 
		    	sortable: true, 
		    	dataIndex: 'ptype_name'
		    },{
		    	header: "Форма оплаты", 
		    	width: 25, 
		    	sortable: true, 
		    	hidden:true,
		    	dataIndex: 'payment_type'
		    },{
		    	header: "Телефон", 
		    	width: 35, 
		    	sortable: false, 
		    	dataIndex: 'patient_phone'
		    },{
		    	header: "Оператор", 
		    	width: 35, 
		    	sortable: true, 
		    	dataIndex: 'operator_name'
		    }
		    
		];		
		
		
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
//			id:'preorder-grid',
//			title:'Предзаказы',
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
//                    	this.btnSetDisabled(false);
                    },
                    rowdeselect: function(sm, row, rec) {
                    	this.fireEvent('serviceselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().reset();
                    	this.btnSetDisabled(true);
                    },
                    scope:this
                }
			}),
			tbar:this.ttb,
	        bbar: this.hasPatient ? [] :{
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
				showPreview:true,
				emptyText:'На выбранную дату предзаказов нет',
				enableRowBody:true,
				getRowClass: function(record, index, p, store) {
            		var service = record.get('service');
            		var visit = record.get('visit');
            		var today = new Date();
            		var start_date = record.data.start.clone(); 
            		var actual = start_date.clearTime() >= today.clearTime();
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
//				rowdblclick:this.onVisit.createDelegate(this, []),
//				scope:this
			}
		};
		
		this.initToolbar();

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.registry.PreorderGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		this.store.on('write', function(){
			var record = this.getSelected();
			if (record){
				if (record.data.visit){
					this.visitButton.setDisabled(true);
				}
			}
			//this.store.load();
		}, this);
		this.on('serviceselect', this.onServiceSelect, this);
		this.on('afterrender', function(){
			if (!this.hasPatient){
				this.store.setBaseParam('timeslot__start__range',String.format('{0},{1}',this.start_date.format('Y-m-d 00:00'),this.start_date.format('Y-m-d 23:59')))
				this.store.setBaseParam('timeslot__isnull',false);
				this.store.load();
			}
		},this);
		App.calendar.eventManager.on('preorderwrite', function(){
			this.store.load()}, 
		this);
		//this.store.on('write', this.onStoreWrite, this);
	},

	onGlobalSearch: function(v){
		var s = this.store;
		s.baseParams = { format:'json' };
		s.setBaseParam('search', v);
		s.load();
	},
	
	btnSetDisabled: function(status) {
        this.visitButton.setDisabled(status);
        this.clearButton.setDisabled(status);
	},
	
	onServiceSelect: function(record){
//		this.btnSetDisable(false);
//		var record = this.getSelectionModel().getSelected();
        var today = new Date();
        var actual = record.data.start.clearTime() >= today.clearTime();
        if (!record.data.visit && actual) {
        	this.visitButton.setDisabled(false);
        } else {
        	this.visitButton.setDisabled(true);
        };
        this.clearButton.setDisabled(false);
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	onVisitButtonClick: function() {
        var record = this.getSelected();
        if (record) {
        	var today = new Date();
        	var actual = record.data.start.clearTime() >= today.clearTime();
        	if (record.data.visit){
        		Ext.Msg.alert('Уведомление','Предзаказ уже был оформлен')
        		return
        	};
        	if (!record.data.visit && actual) {
        		if (!record.data.service){
			    	Ext.Msg.confirm(
						'Создать приём?',
						'В выбранном предзаказе не указана услуга. Создать приём всё равно?',
						function(btn){
							if (btn=='yes'){
								this.visitAdd(record)
							}
						},
						this
					);
        		} else {
   	    			this.visitAdd(record);
        		}
    	    };
        } else {
        	Ext.Msg.alert('Уведомление','Не выбран ни один предзаказ')
        }
    },
    
    onDelPreorderClick : function() {
    	var record = this.getSelected();
    	if (!record) {
    		return false
    	};
    	this.eventStore.setBaseParam('preord',App.uriToId(record.data.id))
    	this.eventStore.load({calback:function(records){
    		if (records[0]){
    			records[0]['vacancy'] = true
    		}
    	},scope:this})
    	this.store.remove(record)
    	
    },
    
    visitAdd : function(record) {
    	this.record = record;
    	if (!record){
    		Ext.Msg.alert('Ошибка!','Не указан предзаказ!');
    		return
    	};
    	if (!record.data.patient){
    		Ext.Msg.alert('Ошибка!','Не указан пациент!');
    		return
    	};
    	if (!(state == record.data.execution_place) && record.data.service){
    		Ext.Msg.alert('Ошибка!','Вы не можете работать с этой организацией!');
    		return
    	};
    	this.patientStore.setBaseParam('id',App.uriToId(record.data.patient));
    	this.patientStore.load({callback:function(records,opt,success){
    		if (!records) {
    			Ext.msg.alert('Ошибка','Не указан пациент');
    			return
    		};
    		this.patientRecord = records[0];
    		App.eventManager.fireEvent('launchapp','visittab',{
				preorderRecord:this.record,
				patientRecord:this.patientRecord,
				type:'visit'
			});
    	},scope:this});
    },
    
    storeFilter: function(field, value){
		if(!value) {
			delete this.store.baseParams[field]
		} else {
			this.store.setBaseParam(field, value);
		}
		this.store.load({callback:function(){
			var record = this.getSelected();
			if (record){
				this.onServiceSelect(record);
			} else {
				this.btnSetDisabled(true);
			};
		},scope:this});
		this.btnSetDisabled(true);
	},
	
	onPrevClick: function(){
		this.start_date = this.start_date.add(Date.DAY,-1);
		this.startDateField.setValue(this.start_date);
		this.storeFilter('timeslot__start__range',String.format('{0},{1}',this.start_date.format('Y-m-d 00:00'),this.start_date.format('Y-m-d 23:59')));
		this.btnSetDisabled(true);
	},
	
	onNextClick: function(){
		this.start_date = this.start_date.add(Date.DAY,1);
		this.startDateField.setValue(this.start_date);
		this.storeFilter('timeslot__start__range',String.format('{0},{1}',this.start_date.format('Y-m-d 00:00'),this.start_date.format('Y-m-d 23:59')));
		this.btnSetDisabled(true);
	},
	
	initToolbar: function(){
		this.ttb.doLayout();
	}
});



Ext.reg('preordergrid', App.registry.PreorderGrid);