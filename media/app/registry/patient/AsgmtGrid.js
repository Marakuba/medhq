Ext.ns('App.patient');

App.patient.AsgmtGrid = Ext.extend(Ext.grid.GridPanel, {

	loadInstant: false,
	
	initComponent : function() {
		
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('extpreorder')
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    //successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects'
		}, App.models.preorderModel);
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false  
		});
		
		this.store = new Ext.data.GroupingStore({
		    baseParams: {
		    	format:'json',
		    	timeslot__isnull:true
		    },
		    paramNames: {
			    start : 'offset',  // The parameter name which specifies the start row
			    limit : 'limit',  // The parameter name which specifies number of rows to return
			    sort : 'sort',    // The parameter name which specifies the column to sort on
			    dir : 'dir'       // The parameter name which specifies the sort direction
			},
			remoteSort: true,
		    restful: true,     // <-- This Store is RESTful
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer    // <-- plug a DataWriter into the store just as you would a Reader
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
		
		
		this.columns =  [
		    {
		    	header: "Пациент", 
		    	width: 60, 
		    	sortable: true, 
		    	dataIndex: 'patient_name',
		    	hide: this.patient ? true : false
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
		    }
		];		
		
		this.visitButton = new Ext.Button({
			iconCls:'silk-add',
			disabled:true,
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
		
		this.ttb = new Ext.Toolbar({
			items:[{
						xtype:'button',
						iconCls:'med-usersetup',
						text:'Новое направление',
						handler:this.onCreate.createDelegate(this)
					},
					this.visitButton,this.clearButton,'-',{
				text:'Реестр',
				handler:function(){
					Ext.ux.Printer.print(this);
				},
				scope:this
			}]
		});
		
		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			title:'Назначения',
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true,
				listeners: {
                    rowselect: function(sm, row, rec) {
                    	this.fireEvent('preorderselect', rec);
                    },
                    rowdeselect: function(sm, row, rec) {
                    	this.fireEvent('preorderselect', rec);
                    	this.btnSetDisabled(true);
                    },
                    scope:this
                }
			}),
			tbar:this.ttb,
	        bbar: new Ext.PagingToolbar({
	            pageSize: 100,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			viewConfig : {
				forceFit : true,
				showPreview:true,
				enableRowBody:true,
				getRowClass: function(record, index, p, store) {
            		var service = record.get('service');
            		var visit = record.get('visit');
//            		var today = new Date();
//            		var start_date = record.data.start.clone(); 
//            		var actual = start_date.clearTime() >= today.clearTime();
            		if (record.data.comment){
            			p.body = '<p class="helpdesk-row-body"> Комментарий: '+record.data.comment+'</p>';
            		};
            		if (visit) {
                		return 'preorder-visited-row-body';
            		};
            		if (!(state == record.data.execution_place) && record.data.service) {
            			return 'preorder-other-place-row-body';
            		};
            		if (actual) {
                		return 'preorder-actual-row-body';
            		};
            		return 'preorder-deactive-row-body';
        		}
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.AsgmtGrid.superclass.initComponent.apply(this, arguments);
		
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
	
	setActivePatient: function(rec) {
		id = rec.id;
		this.patientId = id;
		this.patientRecord = rec;
		var s = this.store;
		s.baseParams = {format:'json','patient': id, 'timeslot__isnull':true};
		s.load();
	},
	
	onPreorderSelect: function(record){
        if (!record.data.visit) {
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
        	if (record.data.visit){
        		Ext.Msg.alert('Уведомление','Предзаказ уже был оформлен')
        		return
        	} else {
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
    
    onCreate: function(){
		if (this.patientRecord) {
			App.eventManager.fireEvent('launchapp','asgmttab',{
				patientRecord:this.patientRecord
			});
		}
	}
	
	
});



Ext.reg('asgmtgrid',App.patient.AsgmtGrid);