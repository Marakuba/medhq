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
		    {name: 'value'},
		    {name: 'inputlist'},
		    {name: 'measurement'},
		    {name: 'validation'},
		    {name: 'is_validated', type:'bool'}
		]);
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false,
		    writeAllFields: true
		});
		this.gf = this.mode =='single' ? false : 'service_name'; 
		this.store = new Ext.data.GroupingStore({
			autoLoad:true,
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
		    groupField:this.gf,
		    sortInfo: {field:this.gf, direction:'DESC'}
		});
		if(this.filtering) {
			Ext.apply(this.store.baseParams, this.filtering);
		};
		
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
		
		this.columns =  [{
				header: "V",
				width:1,
				sortable: true, 
				dataIndex: 'validation',
		    	renderer: function(val,meta,record) {
		    		var icon;
		    		if (val==0) {
		    			icon = "question.png";
		    		} else if (val==-1) {
		    			icon = "no.gif";
		    		} else if (val==1) {
		    			icon = "yes.gif";
		    		};
		    		return String.format("<img src='{0}resources/images/icon-{1}'>", MEDIA_URL, icon);
		    	},
		    	editor: this.statusCmb
			},/*{
		    	xtype:'checkcolumn',
		    	header: "V", 
		    	width: 1, 
		    	dataIndex: 'is_validated'
		    },*/{
		    	header: "№ заказа", 
		    	width: 5, 
		    	sortable: true, 
		    	hidden: this.orderRecord!=undefined,
		    	dataIndex: 'barcode'
		    },{
		    	header: "Лаборатория", 
		    	width: 5, 
		    	sortable: true, 
		    	hidden: this.orderRecord!=undefined,
		    	dataIndex: 'laboratory'
		    },{
		    	header: "Исследование",
		    	width:20,
		    	sortable: true, 
		    	hidden:true,
		    	dataIndex: 'service_name'
		    },{
		    	header: "Пациент",
		    	width:20,
		    	sortable: true, 
		    	hidden:this.orderRecord!=undefined,
		    	dataIndex: 'patient'
		    },{
		    	header: "Исследование", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'analysis_name'
		    },{
		    	header: "Результат", 
		    	width: 25, 
		    	sortable: true, 
		    	dataIndex: 'value',
		    	editor:new Ext.form.TextField({})
		    },{
		    	header: "Ед.измерения", 
		    	width: 8, 
		    	sortable: true, 
		    	dataIndex: 'measurement'
		    }
		];		
		
		this.dateField = new Ext.form.DateField({
			format:'d.m.Y'
		});
		
		this.timeField = new Ext.form.TimeField({
			width:70,
			format:'H:i'
		});
		
		this.staffField = new Ext.form.LazyComboBox({
			proxyUrl:get_api_url('position')
		});
		
		this.ttb = new Ext.Toolbar({ 
			items:[
			{
				xtype:'buttongroup',
				title:'Выполнено',
				items:[this.dateField, this.timeField, {
					text:'Сейчас',
					handler:function(){
						var now = new Date();
						this.dateField.setValue(now);
						this.timeField.setValue(now);
					},
					scope:this
				}],
				hidden:this.mode!='single'
			}, {
				xtype:'buttongroup',
				title:'Врач',
				items:[this.staffField, {
					text:'Текущий',
					handler:function(){
						this.staffField.setValue(String.format('/api/v1/dashboard/position/{0}', active_profile));
					},
					scope:this
				}],
				hidden:this.mode!='single'
			},'->',
			{
				xtype:'buttongroup',
				title:'Операции с тестами',
				items:[{
					text:'Обновить',
					handler:function(){
						this.store.reload();
					},
					scope:this
				},{
					text:'Очистить',
					handler: function(){
						var un = [];
						var records = [];
						var q = this.store.query('is_validated', false);
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
									this.store.remove(records);
									/*q.each(function(rec,i){
										console.log(rec);
										this.store.remove(rec);
									},this);*/	
								}
						}, this);
					},
					scope:this
				},{
					text:'Восстановить',
					handler:function(){
						console.dir(this.orderRecord.data);
						var s = this.store;
						if (s.getCount()) {
							order = App.uriToId(s.getAt(0).data.order);
							params = {
								order:order,
								service:this.orderRecord.data.id
							}
							Ext.MessageBox.confirm('Подтверждение',
								'Восстановить все тесты?',
								function(btn){
									if(btn=='yes') {
										Ext.Ajax.request({
											url:'/lab/revert_results/',
											params:params,
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
				}],
				hidden:this.mode!='single'
			},{
				xtype:'buttongroup',
				title:'Сортировка',
				width:150,
				items:[{
					xtype:'button',
					enableToggle:true,
					toggleGroup:'is-validated-group',
					text:'Все',
					pressed: true,
					handler:this.storeFilter.createDelegate(this,['is_validated'])
				},{
					xtype:'button',
					enableToggle:true,
					toggleGroup:'is-validated-group',
					text:'V',
					handler:this.storeFilter.createDelegate(this,['is_validated',true])
				},{
					xtype:'button',
					enableToggle:true,
					toggleGroup:'is-validated-group',
					text:'X',
					handler:this.storeFilter.createDelegate(this,['is_validated',false])
				}]
			}]
		}); 
		
		this.pagingBBar = new Ext.PagingToolbar({
	            pageSize: 100,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей",
	            items:[{
		    		xtype:'tbtext',
		    		text:this.orderRecord 
		    				? String.format("Пациент: {0}, возраст: {1}", this.orderRecord.data.patient, this.orderRecord.data.patient_age) 
		    				: ''
		    	}]
	        });
	        
	    this.infoBBar = new Ext.Toolbar({
	    	items:[{
	    		xtype:'tbtext',
	    		text:this.orderRecord 
						? String.format("Пациент: {0}, возраст: {1}", this.orderRecord.data.patient, this.orderRecord.data.patient_age) 
						: ''
	    	},'->',{
	    		text:'Сохранить',
	    		hidden: this.mode!='single',
	    		handler:function(){
	    			var d = this.dateField.getValue();
	    			var t = this.timeField.getValue().split(':');
	    			if (d) {
	    				d = d.add(Date.HOUR, t[0]).add(Date.MINUTE,t[1]);
	    			}
	    			var staff = this.staffField.getValue();
	    			var rec = this.orderRecord; 
	    			if(rec) {
	    				rec.beginEdit();
	    				rec.set('executed',d ? d : '');
	    				if(staff) {
	    					rec.set('staff',staff);
	    				}
	    				rec.endEdit();
	    			}
	    			App.eventManager.fireEvent('closeapp', this.id);
	    		},
	    		scope:this
	    	},{
	    		text:'Закрыть',
	    		hidden: this.mode!='single',
	    		handler:function(){
	    			App.eventManager.fireEvent('closeapp', this.id);
	    		},
	    		scope:this
	    	}]
	    });
		
		var config = {
			//id:this.filtering ? 'result_grid_'+this.filtering.k+'_'+this.filtering.v : Ext.id(),
			title:'Тесты',
			closable:true,
			clicksToEdit:1,
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			stripeRows:true,
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true
			}),
	        tbar:this.ttb,
			bbar: this.infoBBar,
			listeners: {
//				cellclick:function(grid,row,col,e) {
//					this.inputlistXY = e.xy;
//				},
				beforeedit: function(e) {
					var analysis = e.record.data.inputlist;
					if(analysis.length){
						this.win = new App.result.InputListWindow({
							analysis:analysis,
							x:350
//							x:this.inputlistXY[0]-350,
//							y:this.inputlistXY[1]+20
						});
						this.win.on('inputlist', function(val){
							if(val){
								e.record.beginEdit();
								e.record.set('value',val);
								e.record.set('is_validated',true);
								e.record.endEdit();
							}
						}, this);
						this.win.show();
					}
				},
				afteredit: function(e) {
					if(e.value) {
						e.record.set('is_validated',true);
					} else {
						e.record.set('is_validated',false);
					}
				},
				scope:this
			},
			view : new Ext.grid.GroupingView({
				forceFit : true,
				emptyText: 'Нет записей',
				groupTextTpl:this.mode=='order' ? "{text} <span style='padding-left:10px; color:gray;font-variant:italic'>Лаборатория: {[values.rs[0].data['laboratory']]}" : "{text}</span>"
				//getRowClass : this.applyRowClass
			})
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.result.ResultGrid.superclass.initComponent.apply(this, arguments);
		//App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		
		if(this.orderRecord) {
			//console.dir(this.orderRecord.data);
			var d = this.orderRecord.data;
			this.staffField.setValue(d.staff);
			this.dateField.setValue(d.executed);
			this.timeField.setValue(d.executed);
			if(this.mode=='single') {
				this.setTitle(String.format("Заказ {0}, {1}",d.barcode, d.service_name));
			} else if(this.mode=='laborder') {
				this.setTitle(String.format("Заказ {0}, {1}",d.barcode, d.laboratory));
			} else if(this.mode=='order') {
				this.setTitle(String.format("Заказ {0}", d.barcode));
			}
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
				this.storeFilter('visit__patient__last_name__istartswith', v);
			} else {
				this.storeFilter('visit__barcode', vi);
			}
		} else {
			delete this.store.baseParams['visit__patient__last_name__istartswith'];
			delete this.store.baseParams['visit__barcode'];
			this.store.load();
		}
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