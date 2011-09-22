Ext.ns('App.laboratory');

App.laboratory.LabOrderGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoSave : true,
			autoLoad : false,
			apiUrl : get_api_url('laborder'),
			model: App.models.LabOrder
		});

		this.fields = [
  		    ['start_date','visit__created__gte','Дата с','Y-m-d 00:00'],
  		    ['end_date','visit__created__lte','по','Y-m-d 23:59'],
  		    ['laboratory','laboratory','Лаборатория'],
  		    ['staff','staff','Врач'],
  		    ['patient','visit__patient','Пациент']
  		];
		   		
		this.columns =  [{
		    	header: "Заказ", 
		    	width: 6, 
		    	sortable: true, 
		    	dataIndex: 'barcode'
		    },{
		    	header: "Дата", 
		    	width: 10, 
		    	sortable: true, 
		    	dataIndex: 'visit_created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y')
		    },{
		    	header: "Пациент", 
		    	width: 40, 
		    	sortable: true, 
		    	dataIndex: 'patient_name'
		    },{
		    	header: "Лаборатория", 
		    	width: 15,
		    	dataIndex: 'laboratory_name'
		    },{
		    	header: "Врач", 
		    	width: 15,
		    	dataIndex: 'staff_name'
		    },{
		    	header: "Выполнено", 
		    	width: 11, 
		    	sortable: true, 
		    	dataIndex: 'executed',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y H:i')
		    }
		];		
		
		this.openBtn = new Ext.Button({
			text:'Открыть заказ',
			disabled:true,
			handler:this.onOpen.createDelegate(this, [this.laborderModeFunc]),
			scope:this
		});
		
		this.labs = new Ext.CycleButton({
            showText: true,
            prependText: 'Лаборатория: ',
            items: [{
                text:'любая',
                checked:true,
                filterValue:undefined
            }]
		});
		
		this.ttb = new Ext.Toolbar({ 
			items:[{
				text:'Фильтр',
				handler:function(){
					this.searchWin = new App.laboratory.SearchWindow({
						store:this.store,
						fields:this.fields
					});
					this.searchWin.on('updatefilters', this.updateFilterStatus, this);
					this.searchWin.show(this.getEl());
				},
				scope:this
			},{
				iconCls:'icon-clear-left',
				handler:function(){
					Ext.state.Manager.getProvider().set('lab-order-filters', {});
					this.updateFilters({});
				},
				hidden:true,
				scope:this
			},'->',new Ext.CycleButton({
	            showText: true,
	            prependText: 'Выполнено: ',
	            items: [{
	                text:'все',
	                checked:true,
	                filterValue:undefined
	            },{
	                text:'да',
	                iconCls:'icon-state-yes',
	                filterValue:true
	            },{
	                text:'нет',
	                iconCls:'icon-state-no',
	                filterValue:false
	            }],
	            changeHandler:function(btn, item){
	            	this.storeFilter('is_completed',item.filterValue);
	            },
	            scope:this
	        })]
		}); 
		
		this.filterText = new Ext.Toolbar.TextItem({
			text:'Фильтры не используются',
		});
		
		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true,
				listeners: {
					rowselect: function(sm, i, rec) {
//						this.printBtn.enable();
//						this.openBtn.enable();
					},
					scope:this
				}
			}),
	        tbar:this.ttb,
			listeners: {
//				rowdblclick:this.onOpen.createDelegate(this, [this.laborderModeFunc])
			},
			bbar: new Ext.PagingToolbar({
	            pageSize: 100,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей",
	            items:['-',this.filterText]
	        }),
			view : new Ext.grid.GridView({
				forceFit : true,
				emptyText: 'Нет записей',
				getRowClass: function(record, index) {
		            var c = record.get('is_completed');
		            return c ? 'x-lab-complete' : 'x-lab-incomplete';
		        }
			})			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.laboratory.LabOrderGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
//		this.initLabs();
		this.on('afterrender', function() {
			var filters = Ext.state.Manager.getProvider().get('lab-order-filters');
			this.updateFilters(filters);
		}, this);
	},
	
	updateFilters : function(filters) {
		Ext.each(this.fields, function(field){
			if(filters[field[0]]) {
				this.storeFilter(field[1], filters[field[0]][0], false);
			} else {
				delete this.store.baseParams[field[1]];
			}
		}, this);
		this.updateFilterStatus(filters);
		this.store.load();
	},
	
	updateFilterStatus : function(filters) {
		var filtersText = [];
		Ext.each(this.fields, function(field){
			if(filters[field[0]]) {
				filtersText.push(String.format("{0}: {1}", field[2], filters[field[0]][1]));
			}
		}, this);
		this.filterText[filtersText.length ? 'addClass' : 'removeClass']('x-filters-enabled');
		this.filterText.setText(filtersText.length ? String.format('{0}',filtersText.join(' ')) : 'Фильтры не используются');
		this.getTopToolbar().items.itemAt(1).setVisible(filtersText.length>0);
	},
	
	onOpen: function(f){
		var rec = this.getSelected();
		if(rec) {
			config = { 
				labOrderRecord:rec,
				scope:this,
				fn:function(rec) {
					
				}
			}
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
	
	storeFilter: function(field, value, autoLoad){
		var autoLoad = autoLoad==undefined ? true : autoLoad;
		if(value==undefined) {
			delete this.store.baseParams[field]
		} else {
			this.store.setBaseParam(field, value);
		}
		if (autoLoad) {
			this.store.load();
		}
	},
	
	initLabs: function(){
		// laboratory
		Ext.Ajax.request({
			url:get_api_url('medstate'),
			method:'GET',
			success:function(resp, opts) {
				var jsonResponse = Ext.util.JSON.decode(resp.responseText);
				var items = [{
	                text:'любая',
	                checked:true,
	                filterValue:undefined
	            }];
				Ext.each(jsonResponse.objects, function(item,i){
					items.push({
						filterValue:item.id,
						text:item.name,
					});
				}, this);
				this.ttb.add(new Ext.CycleButton({
		            showText: true,
		            prependText: 'Лаборатория: ',
		            items: items,
		            changeHandler:function(btn, item){
		            	this.storeFilter('laboratory',item.filterValue);
		            },
		            scope:this
				}));
				this.ttb.doLayout();
			},
			scope:this
		});
		
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



Ext.reg('labordergrid',App.laboratory.LabOrderGrid);