Ext.ns('App.patient');

App.patient.VisitGrid = Ext.extend(Ext.grid.GridPanel, {

	loadInstant: false,
	//id:'patient-visit-grid',
	initComponent : function() {
		
		// Create a standard HttpProxy instance.
		this.proxy = new Ext.data.HttpProxy({
		    url: '/dashboard/api/v1/visit',
		    /*listeners:{
		    	exception: function(proxy, type, action, options, resp, args){
		    		console.log("error on server, action is ", action);
		    		if (action=='create' || action=='update'){
		    			//Ext.getCmp('visit-submit-btn').enable();
		    		}
		    	}
		    }*/
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'created', type:'date',format:'c', allowBlank: true},
		    {name: 'cls', allowBlank: false},
		    {name: 'patient', allowBlank: false},
		    {name: 'patient_id', allowBlank: true},
		    {name: 'referral', allowBlank: true},
		    {name: 'source_lab', allowBlank: true},
		    {name: 'total_price', allowBlank: true},
		    {name: 'total_paid', allowBlank: true},
		    {name: 'operator_name', allowBlank: true},
		    {name: 'patient_name', allowBlank: true},
		    {name: 'is_billed', allowBlank: true, type:'boolean'},
		    {name: 'referral_name', allowBlank: true}
		]);
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false
		});
		
		this.store = new Ext.data.Store({
		    id: 'visit-store',
		    baseParams: {
		    	format:'json'
		    },
		    paramNames: {
			    start : 'offset',  // The parameter name which specifies the start row
			    limit : 'limit',  // The parameter name which specifies number of rows to return
			    sort : 'sort',    // The parameter name which specifies the column to sort on
			    dir : 'dir'       // The parameter name which specifies the sort direction
			},
		    restful: true,     // <-- This Store is RESTful
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer,    // <-- plug a DataWriter into the store just as you would a Reader
		    /*listeners: {
		    	write: function(store, action, result, res, rs) {
		    		App.eventManager.fireEvent('visitwrite',rs);
		    	}
		    }*/
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
		    	//editor: new Ext.form.TextField({})
		    },{
		    	width: 1, 
		    	sortable: true, 
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
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'id',
		    	renderer:function (val){
		    		if(val){
			    		width = val.length;
			    		if (width)
			    		{
			    			return new Array(6-width).join("0")+val;
			    		}
		    		}
		    		return '?'
		    	}, 
		    	editor: new Ext.form.TextField({})
		    },{
		    	header: "Дата", 
		    	width: 30, 
		    	sortable: true, 
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y H:i')
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
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'total_paid', 
		    	renderer: function(v,params,rec){
		    		if(rec.data.cls=='б'){
		    			return "---"
		    		}
		    		return v
		    	}
		    },{
		    	header: "Кто направил", 
		    	width: 80, 
		    	sortable: true, 
		    	dataIndex: 'referral_name', 
		    	editor: new Ext.form.TextField({})
		    },{
		    	header: "Оператор", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'operator_name', 
		    	//editor: new Ext.form.TextField({})
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
			tbar:{
				id:'patient-visit-tbl',
				xtype:'toolbar',
				//disabled:true,
				items:[{
					xtype:'button',
					iconCls:'silk-add',
					text:'Добавить',
					menu:{
						items:[{
							text:'Новый прием',
							iconCls:'med-usersetup',
							handler:this.onCreate.createDelegate(this,['visit'])
						},{
							text:'Поступление биоматериала',
							iconCls:'med-testtubes',
							handler:this.onCreate.createDelegate(this,['material'])
						}]
					}
					
				},{
					xtype:'button',
					iconCls:'silk-printer',
					text:'Печать',
					handler:this.goToSlug.createDelegate(this, ['print'])
				},{
					xtype:'button',
					iconCls:'silk-pencil',
					text:'Изменить',
					handler:this.onChange.createDelegate(this, [])
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
				}*/]
			},
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
		App.patient.VisitGrid.superclass.initComponent.apply(this, arguments);
		//this.ownerCt.ownerCt.on('patientselect', this.setActivePatient, this);
		//App.eventManager.on('patientselect', this.onPatientSelect, this);
	},
	
	setActivePatient: function(id) {
		this.patientId = id;
		var s = this.store;
		s.baseParams = {format:'json','patient': id};
		s.reload();
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

	onCreate: function(type){
		if (this.patientId) {
			App.eventManager.fireEvent('visitcreate',this.patientId,type, false);
		}
	},
	
	onChange: function(){
		var rec = this.getSelected();
		if (rec) {
			var type = rec.data.cls=='п' ? 'visit' : 'material'; /// TODO: тип формы надо определять как-то иначе
			App.eventManager.fireEvent('visitcreate',this.patientId,type,rec.id);
		}
	},
	
	onPatientSelect: function(id) {
		Ext.getCmp('patient-visit-tbl').enable();
		this.patientId = id; //rec.data.id;
		this.store.load({
			params: {
				patient: this.patientId
			}
		});
	},
	
	addVisit: function(values) {
		var Visit = this.store.recordType;
		var v = new Visit(values);
		this.store.insert(0,v);
	}
	
});


Ext.reg('patientvisitgrid', App.patient.VisitGrid);