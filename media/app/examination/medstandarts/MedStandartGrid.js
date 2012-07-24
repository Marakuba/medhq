Ext.ns('App.examination');

App.examination.MedStandartChoiceForm = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.columns =  [{
		    	header: "Наименование", 
		    	width: 60, 
		    	sortable: true, 
		    	dataIndex: 'name'
		    },{
		    	header: "Возрастная категория", 
		    	width: 60, 
		    	sortable: true, 
		    	dataIndex: 'age_category_name'
		    },{
		    	header: "Возраст от", 
		    	width: 20,
		    	dataIndex: 'age_from'
		    },{
		    	header: "Носологическая форма", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'nosological_form'

		    },{
		    	header: "Фаза", 
		    	width: 120, 
		    	sortable: true, 
		    	dataIndex: 'phase_name'
		    },{
		    	header: "Этап", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'stagr_name'
		    },{
		    	header: "Осложнения", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'nosological_form_name'
		    },{
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
			},'-',this.historyBtn/*,'-',{
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
			}*/,'->','Период',{
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
		App.examination.MedStandartChoiceForm.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		
		this.on('destroy', function(){
		    App.eventManager.un('globalsearch', this.onGlobalSearch, this); 
		},this);
		
		this.on('afterrender',function(){
           	this.store.setBaseParam('staff',active_profile);
           	this.store.load();
        })
		
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
		if (rec && !rec.data.executed) {
			config = {
				closable:true,
        		patient:rec.data.patient,
        		patient_name: rec.data.patient_name,
        		ordered_service:rec.data.resource_uri,
				title: rec.data.patient_name +  ': ' + rec.data.service_name,
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
	},
	
	onOpenHistory: function(){
		var rec = this.getSelected();
		if (rec) {
			config = {
				closable:true,
				iconCls:'silk-package',
        		patient:rec.data.patient,
        		patient_name: rec.data.patient_name,
        		ordered_service:rec.data.resource_uri,
				title: rec.data.patient_name + ': История',
				service:rec.data.service,
				print_name:rec.data.service_name,
				staff:this.staff
//				scope:this
			}
			App.eventManager.fireEvent('launchapp', 'patienthistory',config);
		}
	}

	
});



Ext.reg('medstandart',App.examination.MedStandartChoiceForm);