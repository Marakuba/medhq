Ext.ns('App.examorder');

App.examorder.ExamOrderGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {

		this.staff = App.utils.getApiUrl('staff','staff',WebApp.active_staff);

		this.tmp_id = Ext.id();

		this.backend = App.getBackend('examservice');

		this.store = this.backend.store;

		this.columns =  [{
		    	header: "№ заказа",
		    	width: 60,
		    	sortable: true,
		    	dataIndex: 'barcode'
		    },{
		    	header: "Дата",
		    	width: 60,
		    	sortable: true,
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y')
		    },{
		    	header: "Пациент",
		    	width: 300,
		    	dataIndex: 'patient_full'
		    },{
		    	header: "Исследование",
		    	width: 600,
		    	sortable: true,
		    	dataIndex: 'service_name'

		    },{
		    	header: "Выполнено",
		    	width: 120,
		    	sortable: true,
		    	dataIndex: 'executed',
		    	renderer:function(val, meta, record) {
		    		var p = record.data.executed;
		    		var flag = p ? 'yes' : 'no';
		    		var img = "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>"
		    		return String.format("{0} {1}", img, p ? Ext.util.Format.date(p, 'd.m.Y H:i') : "");
		    	}
		    }];

		this.historyBtn = new Ext.Button({
			text:'История пациента',
			iconCls:'silk-package',
			disabled:true,
			handler:this.onOpenHistory,
			scope:this
		});
		this.addBtn = new Ext.Button({
			text:'Добавить карту осмотра',
			iconCls:'silk-add',
			disabled:true,
			handler:this.onAdd.createDelegate(this, [])
		});

		this.ttb = new Ext.Toolbar({
			items:[this.addBtn,{
				text:'Подтвердить выполнение',
				iconCls:'silk-accept',
				id: this.tmp_id + 'order-exec',
				disabled:true,
				handler:function(){
					var record = this.getSelected()
					if (record && !record.data.executed) {
						var now = new Date();
						Ext.Msg.confirm('Заказ выполнен','Подтвердить выполнение?',function(btn){
            				if (btn=='yes') {
            					record.beginEdit();
								record.set('executed', now);
								record.endEdit();
            				}
			        	},this);
					}
				},
				scope:this
			},'-',this.historyBtn,'->','Период',{
				xtype:'datefield',
				format:'d.m.Y',
				emptyText:'с',
				listeners: {
					select: function(df, date){
						this.storeFilter('created__gte',date.format('Y-m-d 00:00'));
					},
					scope:this
				}
			},{
				xtype:'datefield',
				format:'d.m.Y',
				emptyText:'по',
				listeners: {
					select: function(df, date){
						this.storeFilter('created__lte',date.format('Y-m-d 23:59'));
					},
					scope:this
				}
			},'-',{
                text: 'Текущие',
                iconCls:'silk-hourglass',
                enableToggle: true,
                pressed: false,
                toggleHandler: function(btn, pressed) {
                	if (pressed) {
                		this.store.filter('')
                    	this.store.setBaseParam('executed__isnull',true)
                    	this.store.load()
                	} else {
                		delete this.store.baseParams['executed__isnull']
                		this.store.load()
                	}
                },
                scope: this
            },'-',{
				text:'Обновить',
				iconCls:'x-tbar-loading',
				scope:this,
				handler:function(){
					this.store.load()
				}
			}]
		});

		var config = {
			id:'examorder-grid',
			title:'Журнал заказов',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true,
				listeners: {
					rowselect:function(model,ind,rec) {
						if (!rec.data.executed) {
							Ext.getCmp(this.tmp_id+'order-exec').enable()
							this.addBtn.enable();
						} else {
							this.addBtn.disable();
						};
						this.historyBtn.enable();

					},
					rowdeselect: function() {
						Ext.getCmp(this.tmp_id+'order-exec').disable();
						this.addBtn.disable();
						this.historyBtn.disable()
					},
					scope:this
				}
			}),
	        tbar:this.ttb,
			listeners: {
				rowdblclick:this.onAdd.createDelegate(this)
			},
			viewConfig:{
				forceFit:true
			},
			bbar: new Ext.PagingToolbar({
	            pageSize: 25,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        })
		};

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examorder.ExamOrderGrid.superclass.initComponent.apply(this, arguments);
		WebApp.on('globalsearch', this.onGlobalSearch, this);

		this.on('destroy', function(){
		    WebApp.un('globalsearch', this.onGlobalSearch, this);
		},this);

		this.on('afterrender',function(){
           	this.store.setBaseParam('staff',active_profile);
           	this.store.load();
        })

		//this.on('rowcontextmenu', this.onContextMenu, this);
	},

	onAdd: function() {
		var rec = this.getSelected();
		if (!rec) return;
		if (!rec.data.executed) {
			var conf = {
				closable:true,
        		patientId:rec.data.patient,
        		patientName: rec.data.patient_name,
        		orderId:rec.data.id,
        		orderRecord:rec,
				title: rec.data.patient_name +  ': ' + rec.data.service_name,
				baseServiceId:App.utils.uriToId(rec.data.service),
				print_name:rec.data.service_name,
				staff:this.staff
			}

			WebApp.fireEvent('launchapp', 'cardapp',conf);

        } else {
        	var conf = {
        		order_id:rec.data.id
        	}
        	WebApp.fireEvent('launchapp', 'conclusion',conf);
        }


	},

	onGlobalSearch: function(v) {
		if(v) {
			var letter = v.charAt(0);
			if( letter=='#' || letter=='№') {
				v = v.substring(1);
			}
			var vi = parseInt(v);
			if (isNaN(vi)) {
				this.storeFilter('search', v);
			} else {
				this.storeFilter('order__barcode', vi);
			}
		} else {
			delete this.store.baseParams['search'];
			delete this.store.baseParams['order__barcode'];
			this.store.load();
		}
	},

	storeFilter: function(field, value){
		if(!value) {
			//console.log(this.store.baseParams[field]);
			delete this.store.baseParams[field]
			//this.store.setBaseParam(field, );
		} else {
			this.store.setBaseParam(field, value);
		}
		this.store.load();
	},

	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},

	onOpenHistory: function(){
		var rec = this.getSelected();
		if (rec) {
			config = {
				closable:true,
				iconCls:'silk-package',
        		patientId:rec.data.patient,
        		ordered_service:rec.data.resource_uri,
				title: rec.data.patient_name + ': История',
				service:rec.data.service,
				print_name:rec.data.service_name,
				staff:this.staff
//				scope:this
			}
			WebApp.fireEvent('launchapp', 'patienthistory',config);
		}
	}


});



Ext.reg('examordergrid',App.examorder.ExamOrderGrid);
