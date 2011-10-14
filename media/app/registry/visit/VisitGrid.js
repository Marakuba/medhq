Ext.ns('App.visit');



App.visit.VisitGrid = Ext.extend(Ext.grid.GridPanel, {

	loadInstant: false,
	
	initComponent : function() {
		
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('visit')
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'  
		}, [
		    {name: 'id'},
		    {name: 'created', allowBlank: false, type:'date'},
		    {name: 'cls', allowBlank: false},
		    {name: 'total_price', allowBlank: false},
		    {name: 'total_paid', allowBlank: false},
		    {name: 'discount', allowBlank: false},
		    {name: 'discount_value', allowBlank: true},
		    {name: 'barcode_id', allowBlank: true},
		    {name: 'office_name', allowBlank: false},
		    {name: 'operator_name', allowBlank: false},
		    {name: 'patient_name', allowBlank: false},
		    {name: 'is_billed', allowBlank: false, type:'boolean'},
		    {name: 'is_cito', allowBlank: true, type:'boolean'},
		    {name: 'referral_name', allowBlank: false}
		]);
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false   // <-- don't return encoded JSON -- causes Ext.Ajax#request to send data using jsonData config rather than HTTP params
		});
		this.baseParams = {
		    	format:'json'
		}; 
		this.store = new Ext.data.Store({
		    id: 'visit-store',
		    baseParams: this.baseParams,
		    paramNames: {
			    start : 'offset', 
			    limit : 'limit',  
			    sort : 'sort',  
			    dir : 'dir'  
			},
		    restful: true,     
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer
		});
		
		
		this.columns =  [
		    {
		    	width: 1, 
		    	sortable: true, 
		    	dataIndex: 'is_billed', 
		    	renderer: function(val) {
		    		flag = val ? 'yes' : 'no';
		    		return "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>"
		    	}
		    },{
		    	width: 1, 
		    	sortable: false, 
		    	dataIndex: 'cls', 
		    	renderer: function(val) {
		    		var icon;
		    		switch (val) {
			    		case 'п': 
			    				icon='UserSetup.png';
			    				alt='Прием'
			    				break
			    		case 'б': 
			    				icon='TestTubes.png'
			    				alt='Поступление биоматериала'
			    				break
		    		}
		    		return "<img src='"+MEDIA_URL+"resources/css/icons/"+icon+"' title='"+alt+"'>"
		    	}
		    },{
		    	header: "№ заказа", 
		    	width: 10, 
		    	sortable: true, 
		    	dataIndex: 'id',
		    	renderer:function (val){
		    		width = val.length;
		    		if (width)
		    		{
		    			return new Array(6-width).join("0")+val;
		    		}
		    		return val
		    	}
		    },{
		    	header: "BC", 
		    	width: 10, 
		    	sortable: true, 
		    	dataIndex: 'barcode_id'
		    },{
		    	header: "Дата", 
		    	width: 15, 
		    	sortable: true, 
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y H:i')
		    },{
		    	header: "Пациент", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'patient_name'
		    },{
		    	header: "Сумма, руб.", 
		    	width: 30, 
		    	sortable: true, 
		    	dataIndex: 'total_price', 
		    	renderer: function(v,params,rec){
		    		if(rec.data.cls=='б'){
		    			return "---"
		    		} 
		    		return v-(rec.data.discount_value*v/100)
		    	}
		    }/*,{
		    	header: "Оплачено, руб.", 
		    	width: 30, 
		    	sortable: true, 
		    	dataIndex: 'total_paid', 
		    	renderer: function(v,params,rec){
		    		if(rec.data.cls=='б'){
		    			return "---"
		    		} 
		    		return v
		    	}
		    }*/,{
		    	header: "Скидка, %", 
		    	width: 10, 
		    	sortable: true, 
		    	dataIndex: 'discount_value', 
		    	renderer: function(v,params,rec){
		    		if(rec.data.cls=='б'){
		    			return "---"
		    		} 
		    		return v
		    	}
		    },{
		    	header: "Сумма скидки, руб.", 
		    	width: 10, 
		    	sortable: true, 
		    	dataIndex: 'discount_value', 
		    	renderer: function(val, params, rec) {
		    		if(rec.data.cls=='б'){
		    			return "---"
		    		} 
		    		return rec.data.total_price*val/100;
		    	}
		    },{
		    	header: "Кто направил", 
		    	width: 30, 
		    	sortable: true, 
		    	dataIndex: 'referral_name'
		    },{
		    	header: "Офис", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'office_name' 
		    },{
		    	header: "Оператор", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'operator_name' 
		    }
		];		
		
		this.ttb = new Ext.Toolbar({
			items:[{
				xtype:'button',
				iconCls:'silk-printer',
				text:'Печать',
				handler:this.onPrint.createDelegate(this, [])
			},'->','Период',{
				id:'visits-start-date-filter',
				xtype:'datefield',
				format:'d.m.Y',
				name:'start_date',
				listeners: {
					select: function(df, date){
						this.storeFilter('created__gte',date.format('Y-m-d 00:00'));
					},
					scope:this
				}
			},{
				id:'visits-end-date-filter',
				xtype:'datefield',
				format:'d.m.Y',
				name:'end_date',
				listeners: {
					select: function(df, date){
						this.storeFilter('created__lte',date.format('Y-m-d 23:59'));
					},
					scope:this
				}
			},{
				text:'Очистить',
				handler:function(){
					Ext.getCmp('visits-start-date-filter').reset();
					Ext.getCmp('visits-end-date-filter').reset();
					this.storeFilter('created__lte',undefined);
					this.storeFilter('created__gte',undefined);
				},
				scope:this
			},'-']
		});
		
		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
						singleSelect : true
					}),
			listeners: {
				rowdblclick:this.onPrint.createDelegate(this, [])
			},
			tbar:this.ttb,
	        bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
/*	            items:[
	                '-', {
	                pressed: true,
	                enableToggle:true,
	                text: 'Show Preview',
	                cls: 'x-btn-text-icon details',
	                toggleHandler: function(btn, pressed){
	                    var view = grid.getView();
	                    view.showPreview = pressed;
	                    view.refresh();
	                }
	            }]*/
	        }),
			viewConfig : {
				forceFit : true
				//getRowClass : this.applyRowClass
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.visit.VisitGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		this.store.load();		
		this.initToolbar();
	},
	
	
	initToolbar: function(){
		// laboratory
		Ext.Ajax.request({
			url:get_api_url('medstate'),
			method:'GET',
			success:function(resp, opts) {
				this.ttb.add({
					xtype:'tbtext',
					text:'Офис: '
				});
				this.ttb.add({
					xtype:'button',
					enableToggle:true,
					toggleGroup:'ex-place-cls',
					text:'Все',
					pressed: true,
					handler:this.storeFilter.createDelegate(this,['office'])
				});
				var jsonResponse = Ext.util.JSON.decode(resp.responseText);
				Ext.each(jsonResponse.objects, function(item,i){
					this.ttb.add({
						xtype:'button',
						enableToggle:true,
						toggleGroup:'ex-place-cls',
						text:item.name,
						handler:this.storeFilter.createDelegate(this,['office',item.id])
					});
				}, this);
				//this.ttb.addSeparator();
				//this.ttb.add();
				//this.ttb.add()
				this.ttb.doLayout();
			},
			scope:this
		});
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
	
	getAbsoluteUrl: function(id) {
		return "/visit/visit/"+id+"/";
	},
	
	onPrint: function() {
		var id = this.getSelected().data.id;
		var url = ['/visit/print/visit',id,''].join('/');
		window.open(url);
	},
	
	goToSlug: function(slug) {
		var s = this.getSelected().data.id;
		var url = this.getAbsoluteUrl(s)+slug+"/";
		window.open(url);
	},

	onGlobalSearch: function(v){
		var s = this.store;
		s.baseParams = { format:'json' };
		s.setBaseParam('search', v);
		s.load();
	}
	
});

Ext.reg('visitgrid',App.visit.VisitGrid);