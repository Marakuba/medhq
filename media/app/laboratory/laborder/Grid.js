Ext.ns('App.laborder');

App.laborder.LaborderGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {

		this.backend = App.getBackend('labservice');

		this.store = this.backend.store;

		this.columns =  [
		    {
		    	width: 8,
		    	hidden:true,
		    	dataIndex: 'key'
		    },{
		    	width: 1,
		    	sortable: true,
		    	dataIndex: 'is_completed',
		    	renderer: function(val,meta,record) {
		    		flag = record.data.executed ? 'yes' : 'no';
		    		return "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>"
		    	}
		    },{
		    	header: "№ заказа",
		    	width: 8,
		    	hidden:true,
		    	sortable: true,
		    	dataIndex: 'barcode'
		    },{
		    	header: "Дата",
		    	width: 10,
		    	hidden:true,
		    	sortable: true,
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y')
		    },{
		    	header: "Пациент",
		    	width: 50,
		    	hidden:true,
		    	sortable: true,
		    	dataIndex: 'patient'
		    },{
		    	header: "Лаборатория",
		    	width: 23,
		    	hidden:true,
		    	dataIndex: 'laboratory'
		    },{
		    	header: "Исследование",
		    	width: 23,
		    	sortable: true,
		    	dataIndex: 'service_name'
		    },{
		    	header: "Группа",
		    	width: 50,
		    	sortable: true,
		    	hidden:true,
		    	dataIndex: 'lab_group'
		    },{
		    	header: "Врач",
		    	width: 20,
		    	dataIndex: 'staff_name'
		    },/*{
		    	width: 10,
		    	sortable: true,
		    	header:'Напечатано',
		    	dataIndex: 'is_printed',
		    	renderer: function(val, meta, record) {
		    		flag = record.data.printed ? 'yes' : 'no';
		    		return "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>"
		    	}
		    },*/{
		    	header: "Дата/время печати",
		    	width: 10,
		    	sortable: true,
		    	dataIndex: 'printed',
		    	renderer:function(val, meta, record) {
		    		var p = record.data.printed;
		    		var flag = p ? 'yes' : 'no';
		    		var img = "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>"
		    		return String.format("{0} {1}", img, p ? Ext.util.Format.date(p, 'd.m.Y H:i') : "");
		    	}
		    }
		];

		this.singleModeFunc = function(rec) {
			return {
				filtering: {
					'analysis__service':App.uriToId(rec.data.service),
					'order__visit__barcode':rec.data.barcode
				},
				mode: 'single'
			}
		};

		this.orderModeFunc = function(rec) {
			return {
				filtering: {
					'order__visit__barcode':rec.data.barcode
				},
				mode: 'order'
			}
		};

		this.laborderModeFunc = function(rec) {
			return {
				filtering: {
					'order__laboratory':App.uriToId(rec.data.execution_place),
					'order__visit__barcode':rec.data.barcode
				},
				mode: 'laborder'
			}
		};

		this.ttb = new Ext.Toolbar({
			items:['Период',{
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
				xtype:'splitbutton',
				text:'Открыть',
				handler:this.onOpen.createDelegate(this, [this.singleModeFunc]),
				menu:{
					items:[{
						id:'all-by-visit',
						text:'Все тесты по заказу и лаборатории',
						handler:this.onOpen.createDelegate(this,[ this.laborderModeFunc ])
					},{
						id:'all-by-lab',
						text:'Все тесты по заказу',
						handler:this.onOpen.createDelegate(this,[ this.orderModeFunc ])
					}/*,{
						id:'all-by-group',
						text:'Все тесты по группе',
						handler:this.onOpen.createDelegate(this,['lab_group','order__lab_group'])
					}*/]
				},
				scope:this
			},'-',/*{
				text:'Печать',
				iconCls:'silk-printer',
				handler:function(){
					var rec = this.getSelected();
					var visit = App.uriToId(rec.data.order);
					var lab = App.uriToId(rec.data.execution_place);
					window.open(String.format('/lab/print/results_by_visit/{0}/{1}/', visit, lab));
				},
				scope:this
			},*/'->']
		});

		var config = {
			id:'laborder-grid',
			title:'Журнал заказов',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true
			}),
	        tbar:this.ttb,
			listeners: {
				rowdblclick:this.onOpen.createDelegate(this, [this.singleModeFunc])
			},
			bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			view : new Ext.grid.GroupingView({
				forceFit : true,
				emptyText: 'Нет записей',
				groupTextTpl: "{[values.rs[0].data['barcode']]} от {[values.rs[0].data['created_date']]}"+
				" <span style='padding-left:10px; color:black;'>{[values.rs[0].data['patient']]}</span>" +
				" <span style='padding-left:10px; color:gray;font-variant:italic'>{[values.rs[0].data['laboratory']]}</span>"
				//getRowClass : this.applyRowClass
			})
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.laborder.LaborderGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		this.on('destroy', function(){
		    App.eventManager.un('globalsearch', this.onGlobalSearch, this);
		},this);

		this.initToolbar();
		//this.on('rowcontextmenu', this.onContextMenu, this);
	},

	onContextMenu: function(grid, index, e) {
		console.log(grid);
		console.log(index);
		console.log(e);
	},

	onOpen: function(f){
		var rec = this.getSelected();
		if(rec && Ext.isFunction(f)) {
			config = f(rec);
			Ext.apply(config, {
				orderRecord:rec,
				orderModel:this.backend.getModel(),
				scope:this,
				fn:function(rec) {

				}
			});
			App.eventManager.fireEvent('launchapp', 'resultgrid', config);
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

	initToolbar: function(){
		// laboratory
		Ext.Ajax.request({
			url:App.getApiUrl('medstate'),
			method:'GET',
			success:function(resp, opts) {
				this.ttb.add({
					xtype:'tbtext',
					text:'Лаборатория: '
				});
				this.ttb.add({
					xtype:'button',
					enableToggle:true,
					toggleGroup:'ex-place-cls',
					text:'Все',
					pressed: true,
					handler:this.storeFilter.createDelegate(this,['execution_place'])
				});
				var jsonResponse = Ext.util.JSON.decode(resp.responseText);
				Ext.each(jsonResponse.objects, function(item,i){
					this.ttb.add({
						xtype:'button',
						enableToggle:true,
						toggleGroup:'ex-place-cls',
						text:item.name,
						handler:this.storeFilter.createDelegate(this,['execution_place',item.id])
					});
				}, this);
				//this.ttb.addSeparator();
				//this.ttb.add();
				//this.ttb.add()
				this.ttb.doLayout();
			},
			scope:this
		});

		//group

		/*Ext.Ajax.request({
			url:App.getApiUrl('labgroup'),
			method:'GET',
			success:function(resp, opts) {
				this.ttb.add({
					xtype:'tbtext',
					text:'Группа: '
				});
				this.ttb.add({
					xtype:'button',
					enableToggle:true,
					toggleGroup:'lab-group-cls',
					text:'Все',
					pressed: true,
					handler:this.storeFilter.createDelegate(this,['lab_group'])
				});
				var jsonResponse = Ext.util.JSON.decode(resp.responseText);
				Ext.each(jsonResponse.objects, function(item,i){
					this.ttb.add({
						xtype:'button',
						enableToggle:true,
						toggleGroup:'lab-group-cls',
						text:item.name,
						handler:this.storeFilter.createDelegate(this,['lab_group',item.id])
					});
				}, this);
				this.ttb.doLayout();
				//this.ttb.addSeparator();
			},
			scope:this
		});		*/

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



Ext.reg('labordergrid',App.laborder.LaborderGrid);
