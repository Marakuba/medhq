Ext.ns('App.result');

App.result.BasePlain = Ext.extend(Ext.grid.EditorGridPanel, {

	initComponent : function() {

		this.warnTpl = new Ext.XTemplate(
			'<tpl if="wholes.length">',
			'Данная операция приведет к удалению всех тестов, т.к. нет ни одного отвалидированного значения в следующих исследованиях:',
				'<tpl for="wholes">',
					'<br>{#}. {.}',
					'</tpl>',
				'<br><br>',
			'</tpl>',
			'<tpl if="singles.length">',
			'Следующие тесты не могут быть удалены и <b>должны быть валидированы</b>:',
				'<tpl for="singles">',
					'<br>{#}. {analysis_name}',
					'</tpl>',
				'<br><br>',
			'</tpl>',
			'<tpl if="un.length">',
			'Внимание, данная операция приведет к <b>удалению</b> всех тестов, которые не были помечены как отвалидированные: ',
				'<tpl for="un">',
					'<br>{#}. {analysis_name}',
				'</tpl>',
				'<br><br>',
			'</tpl>',
			'<tpl if="confirm">Продолжить?</tpl>'
		);

		this.proxy = new Ext.data.HttpProxy({
		    url: App.utils.getApiUrl('lab','result')
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
		    {name: 'comment'},
		    {name: 'is_validated', type:'bool'},
		    {name: 'is_group', type:'bool'}
		]);

		this.writer = new Ext.data.JsonWriter({
		    encode: false,
		    writeAllFields: true
		});
		this.store = new Ext.data.GroupingStore({
			autoSave:false,
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

//		this.baseTitle = 'Тесты';
//
//		this.store.on('load',function(store, records, options){
//			this.setTitle(String.format("{0} ({1})", this.baseTitle, records.length));
//		},this);

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

		this.editorColNumber = 4;

		this.columns =  [{
				header: "V",
				width:22,
				sortable: true,
				dataIndex: 'validation',
		    	renderer: function(val,meta,record) {
		    		if(record.data.is_group){
		    			return ""
		    		}
		    		var icon;
		    		if (val==0) {
		    			icon = "question.png";
		    		} else if (val==-1) {
		    			icon = "attention.png";
		    		} else if (val==1) {
		    			icon = "yes.gif";
		    		};
		    		return String.format("<img src='{0}resources/images/icon-{1}'>", MEDIA_URL, icon);
		    	}
//		    	editor: this.statusCmb
			},/*{
		    	width:22,
		    	dataIndex: 'comment',
		    	renderer: function(v){
		    		return v ? '<div class="silk-note" style="height:16px;">&nbsp;</div>' : ''
		    	}
		    },*/{
		    	header: "Исследование",
		    	width:200,
		    	sortable: true,
		    	hidden:true,
		    	dataIndex: 'service_name'
		    },{
		    	header: "Тест",
		    	width: 250,
		    	sortable: true,
		    	dataIndex: 'analysis_name'
		    },{
		    	header: "Пред. результат",
		    	width: 150,
		    	sortable: true,
		    	dataIndex: 'previous_value'
		    },{
		    	header: "Результат",
		    	width: 160,
		    	sortable: true,
		    	dataIndex: 'value',
		    	editor:this.inputListCmb//new Ext.form.TextField({})
		    },{
		    	header: "Ед.изм.",
		    	width: 70,
		    	sortable: true,
		    	dataIndex: 'measurement'
		    },{
		    	header: "Изм.",
		    	width: 80,
		    	sortable: true,
		    	dataIndex: 'modified_by_name'
		    }
		];



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
//			disabled:true,
			clicksToEdit:1,
			loadMask : { msg : 'Подождите, идет загрузка...' },
			stripeRows:true,
			border : false,
			store:this.store,
			cm:new Ext.grid.ColumnModel({
				columns:this.columns,
				store:this.store,
			    getCellEditor : function(colIndex, rowIndex) {
		    		var rec = this.store.getAt(rowIndex);
		    		if(rec.data.is_group){
		    			return
		    		}
			    	var ed = this.config[colIndex].getCellEditor(rowIndex);
			    	if(colIndex==4) {
			    		var inputlist = rec.data.inputlist;
			    		ed.field.getStore().loadData(inputlist);
//			    		console.info(ed);
			    	}
			    	return ed;
			    }
			}),
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : false,
				listeners : {
					beforerowselect : function(sm, row, ke, rec){
//						return !rec.data.is_group
					}
				}
			}),
//	        tbar:this.ttb,
//			bbar: this.infoBBar,
			listeners: {
				afteredit: function(e) {
					if(e.column==4) {
						e.record.beginEdit();
						e.record.set('validation',e.value ? 1 : 0);
						e.record.endEdit();
						this.store.save();
					}
				},
				rowcontextmenu: function(grid,rowindex, e) {
					e.stopEvent();
					var sm = grid.getSelectionModel();
					if(sm.getSelections().length<2){
						var rec = grid.getStore().getAt(rowindex);
						if(rec.data.is_group){
							return
						}
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
							},'-',{
								iconCls:'silk-note',
								text:'Редактировать комментарий',
								handler: this.onAddComment.createDelegate(this, [0]),
								scope:this
							},{
								iconCls:'silk-note-delete',
								text:'Удалить комментарий',
								handler: this.onDeleteComment.createDelegate(this, [0]),
								scope:this
							}]
						});
					}
					this.menu.showAt(e.getXY());
				},
				scope:this
			},
			view : new Ext.grid.GroupingView({
				forceFit : false,
				emptyText: 'Нет записей',
				groupTextTpl:this.mode=='order' ? "{text} <span style='padding-left:10px; color:gray;font-variant:italic'>Лаборатория: {[values.rs[0].data['laboratory']]}" : "{text}</span>",
			    enableRowBody:true,
				getRowClass: function(record, index, p, store) {
					if(record.data.is_group){
						return 'x-result-group'
					}
					var cls = [];
					if(record.data.comment) {
						p.body = String.format('<p class="silk-note result-row-body">{0}</p>',record.data.comment);
						cls.push('x-grid3-row-expanded');
					} else {
						cls.push('x-grid3-row-collapsed');
					}
		            var vd = record.get('validation');
		            var val = record.get('value');
		            if (vd==1 && !val) {
		            	cls.push('x-lab-incomplete');
		            }
		            return cls.join(" ");
		        }
				//getRowClass : this.applyRowClass
			}),
			saveOnActivate:true
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.result.BasePlain.superclass.initComponent.apply(this, arguments);

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

		this.on('destroy', function(){
		    WebApp.un('globalsearch', this.onGlobalSearch, this);
		},this);

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

	onAddComment : function() {
		var rec = this.getSelected();
		if(rec) {
			this.commentWin = new App.result.CommentWindow({
				analysis:rec.data.analysis_name,
				comment:rec.data.comment,
				fn:function(comment){
					rec.set('comment',comment);
					rec.store.save();
					this.commentWin.close();
				},
				scope:this
			});
			this.commentWin.show();
		}
	},

	onDeleteComment : function() {
		var rec = this.getSelected();
		if(rec) {
			rec.set('comment',null);
			rec.store.save();
		}
	},

	onChangeState: function(val){
		var records = this.getSelectionModel().getSelections();
//		this.store.autoSave = false;
		Ext.each(records, function(rec){
			if(rec && !rec.data.is_group) {
				rec.beginEdit();
				rec.set('validation',val);
				rec.endEdit();
			}
		},this);
		this.store.save();
//		this.store.autoSave = true;
	},

	setActiveRecord: function(rec) {
		this.labOrderRecord = rec;

		this.store.setBaseParam('order',this.labOrderRecord.id);
		this.store.load();

//		this.enable();
	},

	onSubmit : function(){
		var un = [];
		var services = {};
		var singles = [];
		var records = [];
		var wholes = []
		var all = this.store.getCount();
		var q = this.store.queryBy(function(record,id){
			return !record.data.is_group;
		});
		q.each(function(rec,i){
			if(!services[rec.data.service_name]){
				services[rec.data.service_name] = { y:[], n:[] };
			}
			if(rec.data.validation === 0) {
				services[rec.data.service_name]['n'].push(rec.data);
			} else if (rec.data.validation === 1) {
				services[rec.data.service_name]['y'].push(rec.data);
			}
		},this);
		for(s in services){
			tests = services[s];
			if(!tests.y.length && tests.n.length==1) {
				singles.push(tests.n[0]);
			} else if(!tests.y.length && tests.n.length>1) {
				wholes.push(s);
			} else {
				un = un.concat(tests.n);
			}
		}
		if(wholes.length || singles.length) {
			Ext.MessageBox.alert('Ошибка!',this.warnTpl.apply({ wholes:wholes, un:[], singles:singles, confirm:false }));
			return
		}
//		if(!un.length && singles.length) {
//			Ext.MessageBox.alert('Ошибка!',this.warnTpl.apply({ wholes:wholes, un:un, singles:singles, confirm:false }));
//			return
//		}
		if(un.length){
			Ext.MessageBox.maxWidth = 700;
			Ext.MessageBox.confirm('Предупреждение!',
				this.warnTpl.apply({ wholes:wholes, un:un, singles:singles, confirm:true }),
				function(btn){
					if(btn=='yes') {
						this.confirm();
					}
			}, this);
		} else {
			this.confirm();
		}
	},

	confirm : function() {
		params = {
			order:this.labOrderRecord.id
		}
		App.direct.lab.confirmResults(this.labOrderRecord.id, function(r, e){
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
			} else {
				Ext.MessageBox.alert('Ошибка!', r.message);
			}
		}, this);
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

	onReload : function(){
		this.store.reload();
	}

});



Ext.reg('baseplainwidget',App.result.BasePlain);
