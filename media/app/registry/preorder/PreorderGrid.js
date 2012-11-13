Ext.ns('App','App.registry','App.preorder','App.choices');

App.registry.PreorderGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		this.updatingStoreCheck = new Ext.form.Checkbox({
			checked:false,
			hidden:this.hasPatient,
			boxLabel:'Автоматическое обновление',
			handler:this.updatingCheckClick.createDelegate(this)
		});

		this.start_date = new Date();

		this.emptyText = this.hasPatient ? 'Для данного пациента предзаказов нет':'На выбранную дату предзаказов нет';

		this.medstateStore = this.medstateStore || new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : true,
			apiUrl : App.utils.getApiUrl('state','medstate'),
			model: App.models.MedState
		});

		this.visitButton = new Ext.Button({
			iconCls:'silk-add',
			disabled:true,
			hidden:this.completed || this.doctorMode ? true : false,
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

		this.staffStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : true,
			apiUrl : App.utils.getApiUrl('staff','position'),
			model: [
				    {name: 'id'},
				    {name: 'resource_uri'},
				    {name: 'first_name', allowBlank: false},
				    {name: 'mid_name'},
				    {name: 'short_name'},
				    {name: 'last_name', allowBlank: false},
				    {name: 'gender', allowBlank: false},
				    {name: 'mobile_phone'},
				    {name: 'home_address_street'},
				    {name: 'email'},
				    {name: 'birth_day', allowBlank: false, type:'date'},
				    {name: 'name'},
				    {name: 'title'},
				    {name: 'department'}
				]
		});

		this.StaffCombo = new Ext.form.LazyClearableComboBox({
        	fieldLabel:'Врач',
        	text:'Врач:',
        	name: 'staff__staff',
			anchor:'98%',
			hideTrigger:false,
        	store:this.staffStore,
		    displayField: 'name',
		    valueField: 'id',
		    listeners:{
		    	'render': function(f){
		    		var el = f.getEl()
		    		el.on('click',this.onChoice.createDelegate(this,['Staff']),this)
		    	},
		    	'select':function(combo,record,index){
		    	},
		    	'clearclick':function(){
		    		delete this.store.baseParams['timeslot__cid'];
		    		this.store.load();
		    	},
		    	scope:this
		    },
		    onTriggerClick:this.onChoice.createDelegate(this,['Staff'])
		});

		this.ttb = new Ext.Toolbar({
			items:[this.visitButton,this.clearButton,'-',{
				text:'Реестр',
				handler:function(){
					Ext.ux.Printer.print(this);
				},
				scope:this
			},'-',this.updatingStoreCheck,'->','Врач:',this.StaffCombo,this.pTypeButton ]
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
			apiUrl : App.utils.getApiUrl('scheduler','extpreorder'),
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
			apiUrl : App.utils.getApiUrl('scheduler','event'),
			model: this.eventModel
		});
		this.patientStore = this.patientStore || new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : false,
			apiUrl : App.utils.getApiUrl('patient','patient'),
			model: App.models.patientModel
		});

		this.columns =  [
		    {
		    	header: "Пациент",
		    	width: 100,
		    	sortable: true,
		    	dataIndex: 'patient_name',
		    	hidden: this.hasPatient ? true : false
		    },{
		    	header: "Услуга",
		    	width: 250,
		    	sortable: true,
		    	dataIndex: 'service_name'
		     },{
		    	header: "Врач",
		    	width: 100,
		    	sortable: true,
		    	dataIndex: 'staff_name'
		    },{
		    	header: "Цена",
		    	width: 50,
		    	sortable: true,
		    	dataIndex: 'price'
		    },{
		    	header: "Место выполнения",
		    	width: 120,
		    	sortable: true,
		    	dataIndex: 'execution_place_name'
		    },{
		    	header: "Время",
		    	width: 50,
		    	sortable: true,
		    	dataIndex: 'start',
		    	renderer:Ext.util.Format.dateRenderer('H:i / d.m.Y')
		    },{
		    	header: "Форма оплаты",
		    	width: 100,
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
		    	width: 100,
		    	sortable: false,
		    	dataIndex: 'patient_phone'
		    },{
		    	header: "Оператор",
		    	width: 90,
		    	sortable: true,
		    	dataIndex: 'operator_name'
		    }

		];


		this.startDateField = new Ext.form.DateField({
			plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')], // маска ввода __.__._____ - не надо точки ставить
			minValue:new Date(1901,1,1),
			format:'d.m.Y',
			value:this.start_date,
			listeners: {
				select: function(df, date){
					this.start_date = date;
					this.storeDateFilter('timeslot__start',this.start_date);
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
				singleSelect : false,
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
	        bbar: this.hasPatient ? undefined :{
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
			viewConfig : this.viewConfig || {
				forceFit : false,
				showPreview:true,
				emptyText :this.emptyText,
				enableRowBody:true,
				getRowClass: App.preorder.getRowClass
			},
			listeners: {
//				rowdblclick:this.onVisit.createDelegate(this, []),
//				scope:this
			}
		};

		this.initToolbar();

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.registry.PreorderGrid.superclass.initComponent.apply(this, arguments);
		WebApp.on('globalsearch', this.onGlobalSearch, this);
		WebApp.on('visitcreate', this.onVisitCreate, this);

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
				var day = this.start_date.getDate();
				var month = this.start_date.getMonth()+1;
				var year = this.start_date.getFullYear();
				this.store.setBaseParam('timeslot__start__year', year);
				this.store.setBaseParam('timeslot__start__month', month);
				this.store.setBaseParam('timeslot__start__day', day);
				this.store.setBaseParam('timeslot__isnull',false);
				if (this.searchValue){
					this.onGlobalSearch(this.searchValue)
				} else {
					//при открытии если выключено автообновление, то загрузить store один раз
					if (!this.updatingStoreCheck.getValue()){
						this.store.load()
					}
				}
			}
		},this);
		App.calendar.eventManager.on('preorderwrite', this.storeReload,this);
		this.on('destroy', function(){
		    App.calendar.eventManager.un('preorderwrite', this.storeReload,this);
		    WebApp.un('globalsearch', this.onGlobalSearch, this);
		    WebApp.un('visitcreate', this.onVisitCreate, this);
		},this);
		//this.store.on('write', this.onStoreWrite, this);
	},

	onVisitCreate: function(){
		if(!this.hasPatient){
			this.storeReload();
		}
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
		var records = this.getSelectionModel().getSelections();
        if (records.length) {
        	App.preorder.accessCheck(records,function(recs){
        		if (recs.length){
		    		WebApp.fireEvent('launchapp','visittab',{
						preorderRecord:recs,
						patientId:App.utils.uriToId(recs[0].data.patient),
						type:'visit'
					});
	        	}
        	},this)
        }




//
//        var record = this.getSelected();
//        if (record) {
//        	var today = new Date();
//        	var actual = record.data.start.clearTime() >= today.clearTime();
//        	if (record.data.visit){
//        		Ext.Msg.alert('Уведомление','Предзаказ уже был оформлен');
//        		return
//        	};
//        	if (!record.data.visit && actual) {
//    			this.visitAdd(record);
//    	    };
//        } else {
//        	Ext.Msg.alert('Уведомление','Не выбран ни один предзаказ');
//        }
    },

    onDelPreorderClick : function() {
    	var record = this.getSelected();
    	if (!record || record.data.visit) {
    		return false
    	};
//    	this.eventStore.setBaseParam('preord',App.utils.uriToId(record.data.id))
//    	this.eventStore.load({calback:function(records){
//    		if (records[0]){
//    			records[0]['vacancy'] = true
//    		}
//    	},scope:this})
    	var causeWin = new App.assignment.DeletePromptWindow({
    		fn: function(cause_uri){
    			if (!cause_uri) return false;
    			this.store.autoSave = false;
    			record.set('deleted',true);
    			record.set('rejection_cause',cause_uri);
    			this.store.autoSave = true;
    			this.store.save();
    			this.store.load();
    			this.btnSetDisabled(true)
    		},
    		scope:this
    	});
    	causeWin.show();
//    	this.store.remove(record)

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
//		this.btnSetDisabled(true);
	},

	onPrevClick: function(){
		this.start_date = this.start_date.add(Date.DAY,-1);
		this.startDateField.setValue(this.start_date);
		this.storeDateFilter('timeslot__start',this.start_date);
		this.btnSetDisabled(true);
	},

	onNextClick: function(){
		this.start_date = this.start_date.add(Date.DAY,1);
		this.startDateField.setValue(this.start_date);
		this.storeDateFilter('timeslot__start',this.start_date);
		this.btnSetDisabled(true);
	},

	initToolbar: function(){
		this.ttb.doLayout();
	},

	storeReload: function(preorder){
		//Не позволять грузить весь store без параметров
		if ((this.store.baseParams['patient'] && (this.store.baseParams['patient'] == App.utils.uriToId(preorder.data.patient))) || this.store.baseParams['timeslot__start__day']) {
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
	},

	updateInfo: function(){
		if(this.updatingStoreCheck.getValue()){
	        this.store.load();
		}
	},
	setUpdating: function(status){
		this.updatingStoreCheck.setValue(status);
	},
	updatingCheckClick: function(checkbox, checked){
		this.fireEvent('setupdating',this,checked);
	},

	onChoice: function(type,source) {
    	if (!type) return false;
    	if (!source) source = type;
    	var name = type+'ChoiceWindow';
        var win = new App.choices[type+'ChoiceWindow']({
       		scope:this,
       		fn:function(record){
       			if (!record){
       				return 0;
       			}
       			this[source+'Combo'].forceValue(record.data.id);
       			this.store.setBaseParam('timeslot__cid',record.data.id);
       			this.store.load();
				win.close();
			}
       	 });
       	win.show();
    }

});



Ext.reg('preordergrid', App.registry.PreorderGrid);
