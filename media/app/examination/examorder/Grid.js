Ext.ns('App.examorder');

App.examorder.ExamOrderGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		Ext.Ajax.request({
			url:get_api_url('position'),
			method:'GET',
			params: {id: active_profile},
			success:function(resp, opts) {
				var jsonResponse = Ext.util.JSON.decode(resp.responseText);
				Ext.each(jsonResponse.objects, function(item,i){
					this.staff = item.staff;
				}, this);
			},
			scope: this
		});
		
		this.tmp_id = Ext.id();
		
		this.backend = App.getBackend('examservice');		
		
		this.store = this.backend.store;
		
		this.columns =  [
		    {
		    	hidden:true,
		    	dataIndex: 'key'
		    },{
		    	header: "Дата/время выполнения", 
		    	width: 200, 
		    	sortable: true, 
		    	dataIndex: 'executed',
		    	renderer:function(val, meta, record) {
		    		var p = record.data.executed;
		    		var flag = p ? 'yes' : 'no';
		    		var img = "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>"
		    		return String.format("{0} {1}", img, p ? Ext.util.Format.date(p, 'd.m.Y H:i') : "");
		    	} 
		    },{
		    	header: "№ заказа", 
		    	width: 60, 
		    	sortable: true, 
		    	dataIndex: 'barcode'
		    },{
		    	header: "Дата", 
		    	hidden:true,
		    	sortable: true, 
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y')
		    },{
		    	header: "Исследование", 
		    	width: 600, 
		    	sortable: true, 
		    	dataIndex: 'service_name'

		    },{
		    	header: "Пациент", 
		    	width: 400,
		    	dataIndex: 'patient_full'
		    }/*{
		    	width: 10, 
		    	sortable: true, 
		    	header:'Напечатано',
		    	dataIndex: 'is_printed', 
		    	renderer: function(val, meta, record) {
		    		flag = record.data.printed ? 'yes' : 'no';
		    		return "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>"
		    	}
		    },*/
		];		
		
		this.singleModeFunc = function(rec) {
			return {
				filtering: {
					'ordered_service':App.uriToId(rec.data.id)
				}
			}
		};
		
		this.orderModeFunc = function(rec) {
			return {
				filtering: {
					'ordered_service__order__patient':rec.data.patient
				}
			}
		};
		
		this.examorderModeFunc = function(rec) {
			return {
				filtering: {
					'order__laboratory':App.uriToId(rec.data.execution_place),
					'order__visit__barcode':rec.data.barcode
				},
				mode: 'examorder'
			}
		};
		
		this.ttb = new Ext.Toolbar({ 
			items:[{
				text:'Добавить карту осмотра',
				id: this.tmp_id + 'add-exam',
				iconCls:'silk-add',
				disabled:true,
				handler:this.onAdd.createDelegate(this, [])
			},{
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
			},'-',{
				text:'Обновить',
				iconCls:'x-tbar-loading',
				scope:this,
				handler:function(){
					this.store.load()
				}
			},'-',{
				xtype:'splitbutton',
				text:'Открыть',
				handler:this.onOpen.createDelegate(this, ['order']),
				menu:{
					items:[{
						id:'all-by-visit',
						text:'Открыть карты осмотра',
						handler:this.onOpen.createDelegate(this,['order'])
					},{
						id:'all-by-lab',
						text:'Открыть все карты осмотра',
						handler:this.onOpen.createDelegate(this,['patient'])
					}]
				},
				scope:this
			},'->','Период',{
				xtype:'datefield',
				format:'d.m.Y',
				listeners: {
					select: function(df, date){
						this.storeFilter('created__gte',date.format('Y-m-d 00:00'));
					},
					scope:this
				}
			},{
				xtype:'datefield',
				format:'d.m.Y',
				listeners: {
					select: function(df, date){
						this.storeFilter('created__lte',date.format('Y-m-d 23:59'));
					},
					scope:this
				}
			},'-',{
                text: 'Текущие',
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
            },'->']
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
						};
						Ext.getCmp(this.tmp_id+'add-exam').enable()
						
					},
					rowdeselect: function() {
						Ext.getCmp(this.tmp_id+'order-exec').disable();
						Ext.getCmp(this.tmp_id+'add-exam').disable()
					},
					scope:this
				}
			}),
	        tbar:this.ttb,
			listeners: {
				rowdblclick:this.onAdd.createDelegate(this)
			},
			bbar: new Ext.PagingToolbar({
	            pageSize: 25,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        })
		};
		
		this.on('afterrender',function(){
           	this.store.setBaseParam('staff',active_profile);
           	this.store.load();
        })

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examorder.ExamOrderGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		
		//this.on('rowcontextmenu', this.onContextMenu, this);
	},
	
	onOpen: function(mode){
		var rec = this.getSelected();
		if(rec) {
			config = {
				ordered_service : rec.data.resource_uri,
				patient:rec.data.patient,
				mode:mode,
				patient_name:rec.data.patient_name,
				title:'Карты осмотра №'+rec.data.barcode+' ' + rec.data.patient_name
			};
			App.eventManager.fireEvent('launchapp', 'examcardgrid',config);
		}
		//}
	},
	
	onAdd: function() {
		var rec = this.getSelected();
		if (rec) {
			config = {
				closable:true,
        		patient:rec.data.patient,
        		ordered_service:rec.data.resource_uri,
				title: 'Пациент ' + rec.data.patient_name,
				service:rec.data.service,
				print_name:rec.data.service_name,
				staff:this.staff
//				scope:this
			}
//			App.eventManager.fireEvent('launchapp', 'examcardform',config);
			
			App.eventManager.fireEvent('launchapp', 'neocard',config);
			
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
	}

	
});



Ext.reg('examordergrid',App.examorder.ExamOrderGrid);