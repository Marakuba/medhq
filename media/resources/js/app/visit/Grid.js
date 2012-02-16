Ext.ns('App.visit');



App.visit.VisitGrid = Ext.extend(Ext.grid.GridPanel, {

	loadInstant: false,
	
	initComponent : function() {
		
		this.proxy = new Ext.data.HttpProxy({
		    url: '/dashboard/api/v1/visit'
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
		    {name: 'operator_name', allowBlank: false},
		    {name: 'patient_name', allowBlank: false},
		    {name: 'is_billed', allowBlank: false, type:'boolean'},
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
		    		return "<img src='/media/admin/img/admin/icon-"+flag+".gif'>"
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
		    		return "<img src='/media/resources/css/icons/"+icon+"' title='"+alt+"'>"
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
		    		return v
		    	}
		    },{
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
		    },{
		    	header: "Скидка, %", 
		    	width: 10, 
		    	sortable: true, 
		    	dataIndex: 'discount', 
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
		    	dataIndex: 'discount', 
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
		    	header: "Оператор", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'operator_name' 
		    }
		];		
		
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
				rowdblclick:this.goToSlug.createDelegate(this, ['print'])
			},
			tbar:[{
					xtype:'button',
					iconCls:'silk-printer',
					text:'Печать',
					handler:this.goToSlug.createDelegate(this, ['print'])
				},'->','Период',{
					xtype:'datefield',
					format:'d.m.Y',
					name:'start_date'
				},{
					xtype:'datefield',
					format:'d.m.Y',
					name:'end_date'
				},'-',{
					xtype:'button',
					enableToggle:true,
					toggleGroup:'visit-cls',
					text:'Все',
					pressed: true,
					handler:this.storeFilter.createDelegate(this,[])
				},{
					xtype:'button',
					enableToggle:true,
					toggleGroup:'visit-cls',
					text:'Приемы',
					handler:this.storeFilter.createDelegate(this,['cls','п'])
				},{
					xtype:'button',
					enableToggle:true,
					toggleGroup:'visit-cls',
					text:'Материалы',
					handler:this.storeFilter.createDelegate(this,['cls','б'])
				}/*,{
					xtype:'button',
					enableToggle:true,
					toggleGroup:'visit-cls',
					text:'По записи'
				}*/,'-',{
					xtype:'button',
					enableToggle:true,
					toggleGroup:'is_billed',
					text:'Все',
					pressed: true,
					handler:this.storeFilter.createDelegate(this,[])
				},{
					xtype:'button',
					enableToggle:true,
					toggleGroup:'is_billed',
					text:'Проведенные'
				},{
					xtype:'button',
					enableToggle:true,
					toggleGroup:'is_billed',
					text:'Не проведенные'
				}],
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
		
		this.on('destroy', function(){
		    App.eventManager.un('globalsearch', this.onGlobalSearch, this); 
		},this);
	},

	storeFilter:function(k,v){
		if(k && v) {
			this.store.filter(k,v,true,true);
		} else {
			this.store.clearFilter();
		}
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	getAbsoluteUrl: function(id) {
		return "/visit/visit/"+id+"/";
	},
	
	goToSlug: function(slug) {
		var s = this.getSelected().data.id;
		var url = this.getAbsoluteUrl(s)+slug+"/";
		window.open(url);
	},

	onGlobalSearch: function(v){
		var s = this.store;
		s.baseParams = { format:'json' };
		if (typeof(v)=='number') {
			s.setBaseParam('id__exact', parseInt(v));
		} else if (typeof(v)=='string') {
			s.setBaseParam('patient__last_name__istartswith', v);
		}
		s.reload();
	}
	
});

Ext.reg('visitgrid',App.visit.VisitGrid);