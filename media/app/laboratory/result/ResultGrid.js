Ext.ns('App.result');

App.result.ResultGrid = Ext.extend(Ext.grid.EditorGridPanel, {

	initComponent : function() {
		
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('result')
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'order'},
		    {name: 'barcode'},
		    {name: 'patient'},
		    {name: 'service'},
		    {name: 'service_name'},
		    {name: 'analysis'},
		    {name: 'analysis_name'},
		    {name: 'laboratory'},
		    {name: 'previous_value'},
		    {name: 'value'},
		    {name: 'modified_by_name'},
		    {name: 'inputlist'},
		    {name: 'measurement'},
		    {name: 'validation', type:'int'},
		    {name: 'sample'},
		    {name: 'is_validated', type:'bool'}
		]);
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false,
		    writeAllFields: true
		});
		this.store = new Ext.data.GroupingStore({
			autoLoad:false,
		    baseParams: {
		    	format:'json'
		    },
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
		    restful: true,
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer,
		    remoteSort: true,
		    groupField:'service_name'
		});
		
		this.statusCmb = new Ext.form.ComboBox({
			store:new Ext.data.ArrayStore({
					fields:['id','title'],
					data: [ [0,'?'],[-1,'-'],[1,'+'] ]
			}),
			typeAhead: true,
			triggerAction: 'all',
			valueField:'id',
			displayField:'title',
			mode: 'local',
			forceSelection:true,
			selectOnFocus:true,
			editable:false
		});
		
		this.inputListCmb = new Ext.form.ComboBox({
			store:new Ext.data.ArrayStore({
				fields:['title']
			}),
			typeAhead: true,
			triggerAction: 'all',
			valueField:'title',
			displayField:'title',
			mode: 'local',
			forceSelection:false,
			selectOnFocus:true,
			editable:true
		});
		
		this.columns =  [{
				header: "V",
				width:.5,
				sortable: true, 
				dataIndex: 'validation',
		    	renderer: function(val,meta,record) {
		    		var icon;
		    		if (val==0) {
		    			icon = "question.png";
		    		} else if (val==-1) {
		    			icon = "attention.png";
		    		} else if (val==1) {
		    			icon = "yes.gif";
		    		};
		    		return String.format("<img src='{0}resources/images/icon-{1}'>", MEDIA_URL, icon);
		    	},
//		    	editor: this.statusCmb
			},{
		    	header: "Исследование",
		    	width:20,
		    	sortable: true, 
		    	hidden:true,
		    	dataIndex: 'service_name'
		    },{
		    	header: "Тест", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'analysis_name'
		    },{
		    	header: "Пред. результат", 
		    	width: 15, 
		    	sortable: true, 
		    	dataIndex: 'previous_value'
		    },{
		    	header: "Результат", 
		    	width: 15, 
		    	sortable: true, 
		    	dataIndex: 'value',
		    	editor:this.inputListCmb//new Ext.form.TextField({})
		    },{
		    	header: "Ед.изм.", 
		    	width: 7, 
		    	sortable: true, 
		    	dataIndex: 'measurement'
		    },{
		    	header: "Изм.", 
		    	width: 8, 
		    	sortable: true, 
		    	dataIndex: 'modified_by_name'
		    }
		];		
		
		this.dateField = new Ext.form.DateField({
			emptyText:'дата',
			format:'d.m.Y',
			width:80
		});
		
		this.timeField = new Ext.form.TimeField({
			emptyText:'время',
			width:55,
			format:'H:i'
		});
		
		this.staffField = new Ext.form.LazyComboBox({
			emptyText:'врач',
			proxyUrl:get_api_url('position'),
//			displayField:'title',
			width:120
		});
		
		this.printBtn = new Ext.Button({
			iconCls:'silk-printer',
			disabled:true,
			handler:function(){
				var rec = this.getSelected();
				if(rec) {
					var url = String.format('/lab/print/results/{0}/?preview=yes', rec.id);
					window.open(url);
				}
			},
			scope:this
		});
		
		this.ttb = new Ext.Toolbar({ 
			items:[this.dateField, this.timeField, {
//					text:'Сейчас',
					iconCls:'silk-date-go',
					tooltip:'Устанавливает текущую дату и время',
					handler:function(){
						var now = new Date();
						this.dateField.setValue(now);
						this.timeField.setValue(now);
					},
					scope:this
				},
			
				this.staffField, {
//					text:'Текущий',
					iconCls:'silk-user-go',
					tooltip:'Текущий пользователь',
					handler:function(){
						this.staffField.setValue(String.format('/api/v1/dashboard/position/{0}', active_profile));
					},
					scope:this
				},
				
			new Ext.Toolbar.Separator(), {
					iconCls:'icon-save',
//					text:'Сохранить черновик',
					handler:function(){
						if(this.labOrderRecord){
							this.saveSDT(this.labOrderRecord);
						}
					},
					scope:this
				},this.printBtn,'-',{
					iconCls:'silk-accept',
					text:'Подтвердить',
					handler: function(){
						if(this.labOrderRecord){
							this.saveSDT(this.labOrderRecord);
						}
						var un = [];
						var records = [];
						var q = this.store.queryBy(function(record,id){
							return record.data.validation == 0;
						});
						q.each(function(rec,i){
							un.push(rec.data);
							records.push(rec);
						},this);		
						Ext.MessageBox.confirm('Предупреждение!',
							new Ext.XTemplate('Внимание, данная операция приведет к удалению всех тестов, которые не были помечены как отвалидированные: ',
							'<tpl for="."><br>{#}. {analysis_name}</tpl><br><br>',
							'Продолжить?').apply(un),
							function(btn){
								if(btn=='yes') {
									params = {
										order:this.labOrderRecord.id
									}
									Ext.Ajax.request({
										url:'/lab/confirm_results/',
										params:params,
										method:'POST',
										success:function(response, opts) {
											var r = Ext.decode(response.responseText);
											this.store.reload();
											if(r.success) {
												this.labOrderRecord.set('is_completed',true);
												Ext.ux.Growl.notify({
											        title: "Успешная операция!", 
											        message: r.message,
											        iconCls: "x-growl-accept",
											        alignment: "tr-tr",
											        offset: [-10, 10]
											    })
											}
										},
										failure: function(response, opts) {
										},
										scope:this
									});
								}
						}, this);
					},
					scope:this
				},'->',{
//					text:'Восстановить',
					iconCls:'silk-arrow-undo',
					handler:function(){
						var s = this.store;
						if (s.getCount()) {
							Ext.MessageBox.confirm('Подтверждение',
								'Восстановить все тесты?',
								function(btn){
									if(btn=='yes') {
										Ext.Ajax.request({
											url:'/lab/revert_results/',
											params:{
												laborder:this.labOrderRecord.id
											},
											method:'POST',
											success:function(response, opts) {
												this.store.reload();
											},
											failure: function(response, opts) {
											},
											scope:this
										});
									}
							}, this);
						}
					},
					scope:this
				}]
		}); 
		
	    this.infoBBar = new Ext.Toolbar({
	    	items:[{
	    		xtype:'tbtext',
	    		text:this.orderRecord 
						? String.format("Пациент: {0}, возраст: {1}", this.labOrderRecord.data.patient_name, this.orderRecord.data.patient_age) 
						: ''
	    	}]
	    });
		
		var config = {
			title:'Тесты',
			disabled:true,
			clicksToEdit:1,
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			stripeRows:true,
			border : false,
			store:this.store,
			cm:new Ext.grid.ColumnModel({
				columns:this.columns,
				store:this.store,
			    getCellEditor : function(colIndex, rowIndex) {
			    	var ed = this.config[colIndex].getCellEditor(rowIndex);
			    	if(colIndex==4) {
			    		var rec = this.store.getAt(rowIndex);
			    		var inputlist = rec.data.inputlist;
			    		ed.field.getStore().loadData(inputlist);
//			    		console.info(ed);
			    	}
			    	return ed;
			    }
			}),
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : false
			}),
	        tbar:this.ttb,
			bbar: this.infoBBar,
			listeners: {
				afteredit: function(e) {
					if(e.column==4) {
						e.record.beginEdit();
						e.record.set('validation',e.value ? 1 : 0);
						e.record.endEdit();
					}
				},
				rowcontextmenu: function(grid,rowindex, e) {
					e.stopEvent();
					var sm = grid.getSelectionModel();
					if(!sm.getSelections().length){
						sm.selectRow(rowindex);
					}
					if(!this.menu) {
						this.menu = new Ext.menu.Menu({
							items:[{
								iconCls:'icon-state-yes',
								text:'Валидировать',
								handler: this.onChangeState.createDelegate(this, [1]),
								scope:this
							},{
								iconCls:'icon-state-attention',
								text:'Установить предупреждение',
								handler: this.onChangeState.createDelegate(this, [-1]),
								scope:this
							},{
								iconCls:'icon-state-question',
								text:'Снять пометку валидации',
								handler: this.onChangeState.createDelegate(this, [0]),
								scope:this
							}]
						});
					}
					this.menu.showAt(e.getXY());
				},
				scope:this
			},
			view : new Ext.grid.GroupingView({
				forceFit : true,
				emptyText: 'Нет записей',
				groupTextTpl:this.mode=='order' ? "{text} <span style='padding-left:10px; color:gray;font-variant:italic'>Лаборатория: {[values.rs[0].data['laboratory']]}" : "{text}</span>",
				getRowClass: function(record, index) {
		            var vd = record.get('validation');
		            var val = record.get('value');
		            return vd==1 && !val ? 'x-lab-incomplete' : '';
		        }
				//getRowClass : this.applyRowClass
			})
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.result.ResultGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		
		this.on('afterrender', function(){
			new Ext.KeyMap(this.getEl(), {
				key:Ext.EventObject.F2,
				fn:function(code, e){
					e.stopEvent();
					var rec = this.getSelectionModel().getSelected();
					var rowIndex = this.getStore().indexOf(rec);
					this.startEditing(rowIndex,4);
					this.inputListCmb.focus();
				},
				scope:this
			});
		}, this);
		
		if(this.labOrderRecord) {
			var d = this.labOrderRecord.data;
			this.staffField.setValue(d.staff);
			this.dateField.setValue(d.executed);
			this.timeField.setValue(d.executed);
			this.setTitle(String.format("Заказ {0}", d.barcode));
			this.store.setBaseParam('order',this.labOrderRecord.id);
			this.store.load();
		}		
		
	},
	
	onChangeState: function(val){
		var records = this.getSelectionModel().getSelections();
		this.store.autoSave = false;
		Ext.each(records, function(rec){
			if(rec) {
				rec.beginEdit();
				rec.set('validation',val);
				rec.endEdit();
			}
		},this);
		this.store.save();
		this.store.autoSave = true;
	},
	
	setActiveRecord: function(rec) {
		this.labOrderRecord = rec;
		
		this.store.setBaseParam('order',this.labOrderRecord.id);
		this.store.load();

		var d = this.labOrderRecord.data;
		if(d.staff) {
			this.staffField.setValue(d.staff);
		} else {
			this.staffField.setRawValue('');
			this.staffField.originalValue='';
			this.staffField.reset();
		}
		this.dateField.setValue(d.executed);
		this.timeField.setValue(d.executed);
		
		this.enable();
	},
	
	saveSDT: function(rec) {
		var d = this.dateField.getValue();
		var t = this.timeField.getValue().split(':');
		if (d) {
			d = d.add(Date.HOUR, t[0]).add(Date.MINUTE,t[1]);
		}
		var staff = this.staffField.getValue();
		if(rec) {
			rec.beginEdit();
			rec.set('executed',d ? d : '');
			if(staff) {
				rec.set('staff',staff);
			}
			rec.endEdit();
		}
	},
	
	onGlobalSearch: function(v) {
		this.disable();
	},
	
	storeFilter: function(field, value){
		if(value===undefined) {
			delete this.store.baseParams[field]
		} else {
			this.store.setBaseParam(field, value);
		}
		this.store.load();
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	onPrint: function() {
		var id = this.getSelected().data.id;
		var url = ['/lab/print/results',id,''].join('/');
		window.open(url);
	}

	
});



Ext.reg('resultgrid',App.result.ResultGrid);