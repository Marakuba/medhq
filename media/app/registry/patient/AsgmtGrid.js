Ext.ns('App.patient');

App.patient.AsgmtGrid = Ext.extend(Ext.grid.EditorGridPanel, {

	loadInstant: false,
	
	initComponent : function() {
		
		this.start_date = new Date();
		
		this.emptyText = this.hasPatient? 'Для данного пациента направлений нет':'На выбранную дату направлений нет',
		
		this.startDateField = new Ext.form.DateField({
			format:'d.m.Y',
			plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')], // маска ввода __.__._____ - не надо точки ставить
			minValue:new Date(1901,1,1),
			value:this.start_date,
			listeners: {
				select: function(df, date){
					this.start_date = date;
					this.storeDateFilter('expiration',this.start_date);
				},
				scope:this
			}
		});
		
		this.medstateStore = this.medstateStore || new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : true,
			apiUrl : get_api_url('medstate'),
			model: App.models.MedState
		});
		
		this.patientStore = this.patientStore || new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : false,
			apiUrl : get_api_url('patient'),
			model: App.models.patientModel
		});

		this.createButton = new Ext.Button({
			iconCls:'med-usersetup',
			text:'Новое направление',
			hidden:!this.hasPatient,
			handler:this.onCreate.createDelegate(this),
			scope:this
		});
		
		this.visitButton = new Ext.Button({
			iconCls:'silk-add',
			disabled:true,
			hidden:this.card_id,
			text:'Оформить заказ',
			handler:this.onVisitButtonClick.createDelegate(this, []),
			scope:this
		});
		
		this.clearButton = new Ext.Button({
			iconCls:'silk-cancel',
			disabled:true,
			text:'Отменить предзаказ',
			handler:this.onDelPreorderClick.createDelegate(this, []),
			scope:this
		});
		
		this.setTimeButton = new Ext.Button({
			xtype:'button',
			text:'Назначить время',
			hidden:this.card_id,
			disabled:true,
			handler:this.staffWindow.createDelegate(this, []),
			scope:this
		});
		
		this.ttb = new Ext.Toolbar({
			items:[this.createButton,'-',
				this.visitButton, this.clearButton, this.setTimeButton,'-',
				{
					text:'Реестр',
					handler:function(){
						Ext.ux.Printer.print(this);
					},
					scope:this
			},'->']
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
	        this.doLayout()
		},this);
		
		this.store = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : true,
			baseParams:this.baseParams ? this.baseParams : {
				format:'json',
				visit__isnull:true
			},
			apiUrl : get_api_url('visitpreorder'),
			model: App.models.preorderModel
		}); 
		
		
		this.eventModel = new Ext.data.Record.create([
			{name: 'id'},
		    {name: 'resource_uri'},
		    {name: 'status', allowBlank: false}
		]);

		this.eventStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : true,
			apiUrl : get_api_url('event'),
			model: this.eventModel
		});
		
		this.freeTimeslotStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : true,
			apiUrl : get_api_url('event'),
			model: [
				    {name: 'resource_uri'},
				    {name: 'start',type:'date',format:'c'},
				    {name: 'end',type:'date',format:'c'},
				    {name: 'status'},
				    {name: 'timeslot'},
				    {name: 'cid'},
				    {name: 'staff'}
				]
		}); 
		
		this.extServiceStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : false,
			apiUrl : get_api_url('extendedservice'),
			model: [
				    {name: 'resource_uri'},
				    {name: 'staff'},
				    {name: 'id'},
				    {name: 'state'}
				]
		}); 
		
		
		this.columns =  [{
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
		    	header: "Количество", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'count'
		    },{
		    	header: "Выполнено", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'completed_count'
		    }, new Ext.ux.ProgressColumn({
                header: '%',
                width: 70, 
                dataIndex: 'completed_count',
                divisor: 'count',
                align: 'center',
                renderer: function(value, meta, record, rowIndex, colIndex, store, pct) {
                    return Ext.util.Format.number(pct, "0.00%");
                }
            }),{
		    	header: "Цена", 
		    	width: 20, 
		    	hidden:this.card_id,
		    	sortable: true, 
		    	dataIndex: 'price'
		    },{
		    	header: "Врач", 
		    	width: 30, 
		    	sortable: true, 
		    	dataIndex: 'staff_name'
		    },{
		    	header: "Время", 
		    	width: 32, 
		    	sortable: true, 
		    	dataIndex: 'start',
		    	renderer:Ext.util.Format.dateRenderer('H:i / d.m.y')
		    },{
		    	header: "Дата выполнения", 
		    	width: 32, 
		    	sortable: true, 
		    	dataIndex: 'expiration',
		    	renderer:Ext.util.Format.dateRenderer('d.m.y'),
		    	editor: new Ext.form.DateField({
		    		plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')], // маска ввода __.__._____ - не надо точки ставить
					minValue:new Date(1901,1,1),
					format:'d.m.Y'
		    	})
				
		    },{
		    	header: "Место выполнения", 
		    	width: 40, 
		    	sortable: true, 
		    	dataIndex: 'execution_place_name'
		    },{
		    	header: "Телефон", 
		    	width: 35, 
		    	hidden:this.card_id,
		    	sortable: false, 
		    	dataIndex: 'patient_phone'
		    },{
		    	header: "Акция", 
		    	width: 35, 
		    	hidden:this.card_id,
		    	sortable: false, 
		    	dataIndex: 'promotion_name'
		    },{
		    	header: "Оператор", 
		    	width: 35, 
		    	hidden:this.card_id,
		    	sortable: true, 
		    	dataIndex: 'operator_name'
		    }
		];		
		
		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			title:'Направления',
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : false,
				listeners: {
                    rowselect: function(sm, row, rec) {
                    	this.fireEvent('preorderselect', rec);
                    	this.btnSetDisabled(false);
                    },
                    rowdeselect: function(sm, row, rec) {
//                    	this.fireEvent('preorderselect', rec);
                    	this.btnSetDisabled(true);
                    },
                    scope:this
                }
			}),
			tbar:this.ttb,
	        bbar: this.hasPatient ? undefined : {
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
				emptyText :this.emptyText,
				forceFit : true,
				showPreview:true,
				enableRowBody:true,
				getRowClass: function(record, index, p, store) {
            		var service = record.get('service');
            		var visit = record.get('visit');
            		if (record.data.comment){
            			p.body = '<p class="helpdesk-row-body"> Комментарий: '+record.data.comment+'</p>';
            		};
            		if (record.data.start) {
                		return 'preorder-visited-row-body';
            		};
            		if (!(state == record.data.execution_place) && record.data.service && App.settings.serviceTreeOnlyOwn) {
            			return 'preorder-other-place-row-body';
            		};
            		return 'preorder-actual-row-body';
        		},
        		scope:this
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.AsgmtGrid.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender', function(){
			if (!this.hasPatient){
				var day = this.start_date.getDate();
				var month = this.start_date.getMonth()+1;
				var year = this.start_date.getFullYear();
				this.store.setBaseParam('expiration__year', year);
				this.store.setBaseParam('expiration__month', month);
				this.store.setBaseParam('expiration__day', day);
				if (this.searchValue){
					this.onGlobalSearch(this.searchValue)
				} else {
					this.store.load();
				}
			}
		},this);
		App.calendar.eventManager.on('preorderwrite', this.storeReload,this);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		App.eventManager.on('visitcreate', this.onVisitCreate, this);
		
		this.on('destroy', function(){
			App.calendar.eventManager.un('preorderwrite', this.storeReload,this);
			App.eventManager.un('globalsearch', this.onGlobalSearch, this);
			App.eventManager.un('visitcreate', this.onVisitCreate, this);
		},this);
		
		this.store.on('write', function(){
			var record = this.getSelected();
			if (record){
				if (record.data.visit){
					this.visitButton.setDisabled(true);
				}
			}
			//this.store.load();
		}, this);
		
		this.on('preorderselect', this.onPreorderSelect, this);
		
	},
	
	onVisitCreate: function(){
		if(!this.hasPatient){
			this.storeReload();
		}
	},
	
	setActivePatient: function(rec) {
		id = rec.id;
		this.patientId = id;
		this.patientRecord = rec;
		var s = this.store;
		s.baseParams = {format:'json','patient': id, visit__isnull:true};
		if (this.card_id){
			s.setBaseParam('card',this.card_id);
		}
		s.load();
	},
	
	btnSetDisabled: function(status) {
		if (!status){
			var record = this.getSelected();
			if (record.data.visit){
				this.visitButton.setDisabled(true);
	        	this.clearButton.setDisabled(true);
//	        	this.setTimeButton.setDisabled(true);
			}
		} else {
	        this.visitButton.setDisabled(status);
	        this.clearButton.setDisabled(status);
//	        this.setTimeButton.setDisabled(true);
		}
	},
	
	onPreorderSelect: function(record){
		var patient_list = []
		var records = this.getSelectionModel().getSelections();
		if (records.length != 1){
			this.setTimeButton.setDisabled(true)
		} else {
			this.setTimeButton.setDisabled(false)
		}
		
		this.visitButton.setDisabled(false);
        this.clearButton.setDisabled(false);
	},
	
    getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	onVisitButtonClick: function() {
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
			if (this.hasPatient){
				App.eventManager.fireEvent('launchapp','visittab',{
					preorderRecord:recs,
					patientId:this.patientRecord.data.id,
					type:'visit'
				});
	    	} else {
	    		App.eventManager.fireEvent('launchapp','visittab',{
					preorderRecord:recs,
					patientId:App.uriToId(recs[0].data.patient),
					type:'visit'
				});
	    	}
        } else {
        	Ext.Msg.alert('Уведомление','Не выбран ни один предзаказ')
        }
    },
    
    onDelPreorderClick : function() {
    	var records = this.getSelectionModel().getSelections();
    	if(records.length>1) {
    		Ext.MessageBox.confirm('Предупреждение','Будут удалены все выделенные направления. Продолжить?', function(btn){
    			if(btn=='yes') {
    				this.removePreorders(records);
    			}
    		}, this)
    	} else {
    		this.removePreorders(records);
    	}
    },
    
    removePreorders : function(records) {
    	var r = [];
    	Ext.each(records, function(record){
    		if(!record.data.visit) {
    			r.push(record);
    		}
    	});
    	var s = this.store;
    	s.autoSave = false;
    	s.remove(r);
    	s.save();
    	s.autoSave = true;
    },
    
    onCreate: function(){
		if (this.patientRecord) {
			App.eventManager.fireEvent('launchapp','asgmttab',{
				patientId:this.patientId,
				card_id:this.card_id,
				fn: function(asgmttab){
					this.store.load();
					var idList = [];
					var s = asgmttab.form.preorderGrid.store;
					s.each(function(rec){
						idList.push(rec.id);
					});
					console.info(idList);
					var win = new App.patient.AsgmtListWindow({
						idList:idList.join(",")
					});
					win.show();
				},
				scope:this
			});
		} else {
			console.log('не указан пациент')
		}
	},
	staffWindow: function(index){
		var preorder = this.getSelected();
		if (!preorder.data.service || preorder.data.visit){
			return false
		}
		var service = preorder.data.service;
		this.extServiceStore.setBaseParam('id',App.uriToId(preorder.data.service))
		this.extServiceStore.load({callback:function(records){
			var sl = undefined;
			if(records.length){
				sl = records[0].data.staff
				if (!sl){
					Ext.Msg.alert('Предупреждение!','Для данной услуги не указан ни один врач');
					return false
				}
			}
			var win = new App.visit.StaffWindow({
				index:index, 
				staffList:sl,
				service:App.uriToId(preorder.data.service),
				state:App.uriToId(records[0].data.state),
				fn: function(staff){
					win.close();
					this.onMovePreorder(staff.data.id)
				},
				scope:this
			});
			win.show();
		},scope:this});
	},
	
	updateStaff: function(rec, id, staff_name){
		rec.beginEdit();
		rec.set('staff',"/api/v1/dashboard/position/"+id);
		rec.set('staff_name',staff_name);
		rec.endEdit();
	},
	
	onMovePreorder: function(staff_id){
		var preorder = this.getSelected();
    	var freeTimeslotWindow;
        	
        var freeTimeslotGrid = new App.calendar.VacantTimeslotGrid({
       		scope:this,
//       		store:this.freeTimeslotStore,
       		staff_id:staff_id,
       		fn:function(record){
       			if (!record){
       				return false;
       			};
       			preorder.set('timeslot',record.data.resource_uri);
       			record.set('status','з');
				freeTimeslotWindow.close();
				if(this.patientId){
					App.eventManager.fireEvent('patientcardupdate',this.patientId);
				} else {
					this.store.load();
				}
				
			}
       	 });
        	
       	freeTimeslotWindow = new Ext.Window ({
       		width:700,
			height:500,
			layout:'fit',
			title:'Свободные часы работы',
			items:[freeTimeslotGrid],
			modal:true,
			border:false
    	});
       	freeTimeslotWindow.show();
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
	
	storeDateFilter: function(field, value){
		if(!value) {
			delete this.store.baseParams[field+'__year'];
			delete this.store.baseParams[field+'__month'];
			delete this.store.baseParams[field+'__day'];
		} else {
			var day = value.getDate();
			var month = value.getMonth()+1;
			var year = value.getFullYear();
			this.store.setBaseParam(field+'__year', year);
			this.store.setBaseParam(field+'__month', month);
			this.store.setBaseParam(field+'__day', day);
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
		this.storeDateFilter('expiration',this.start_date);
		this.btnSetDisabled(true);
	},
	
	onNextClick: function(){
		this.start_date = this.start_date.add(Date.DAY,1);
		this.startDateField.setValue(this.start_date);
		this.storeDateFilter('expiration',this.start_date);
		this.btnSetDisabled(true);
	},
	
	storeReload: function(){
		if (!(this.hasPatient && !this.patientId)){
			this.store.load()
		}
	},
	
	onGlobalSearch: function(v){
		if(this.hasPatient) return
		var s = this.store;
		if (v){
			s.setBaseParam('search', v);
		} else {
			delete s.baseParams['search']
		}
		s.load();

	}
	
	
});

Ext.reg('asgmtgrid',App.patient.AsgmtGrid);