Ext.ns('App.patient');

App.patient.VisitGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoLoad : false,
			apiUrl : get_api_url('visit'),
			model: [
				    {name: 'id'},
				    {name: 'created', type:'date',format:'c'},
				    {name: 'cls', allowBlank: false},
				    {name: '_cache'},
				    {name: 'patient', allowBlank: false},
				    {name: 'patient_id'},
				    {name: 'referral'},
				    {name: 'barcode_id'},
				    {name: 'discount'},
				    {name: 'discount_value'},
				    {name: 'source_lab'},
				    {name: 'total_price'},
				    {name: 'total_paid'},
				    {name: 'operator_name'},
				    {name: 'patient_name'},
				    {name: 'payment_type'},
				    {name: 'insurance_policy'},
				    {name: 'comment'},
				    {name: 'pregnancy_week'},
				    {name: 'menses_day'},
				    {name: 'menopause'},
				    {name: 'diagnosis'},
				    {name: 'is_billed', type:'boolean'},
				    {name: 'is_cito', allowBlank: true, type:'boolean'},
				    {name: 'referral_name'},
				    {name: 'office_name'}
				],
		});
		
		this.columns =  [
		    /*{
		    	width: 1, 
		    	sortable: true, 
		    	dataIndex: 'is_billed', 
		    	renderer: function(val) {
		    		flag = val ? 'yes' : 'no';
		    		return "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>"
		    	}
		    	//editor: new Ext.form.TextField({})
		    },*/{
		    	width: 8, 
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
		    		return "<img src='"+MEDIA_URL+"resources/css/icons/"+icon+"' title='"+alt+"'>"
		    	}
		    },/*{
		    	header: "№ заказа", 
		    	width: 15, 
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
		    	}
		    },*/{
		    	header: "№ заказа", 
		    	width: 15, 
		    	sortable: true, 
		    	dataIndex: 'barcode_id'
		    },{
		    	header: "Дата", 
		    	width: 28, 
		    	sortable: true, 
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y H:i')
		    },{
		    	header: "Сумма, руб.", 
		    	width: 20, 
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
		    	width: 20, 
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
		    	width: 15, 
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
		    	width: 15, 
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
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'referral_name', 
		    	editor: new Ext.form.TextField({})
		    },{
		    	header: "*", 
		    	width: 1, 
		    	sortable: true, 
		    	dataIndex: 'payment_type'
		    },{
		    	header: "Офис", 
		    	width: 22, 
		    	sortable: true, 
		    	dataIndex: 'office_name' 
		    },{
		    	header: "Оператор", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'operator_name', 
		    	//editor: new Ext.form.TextField({})
		    }
		];		
		
		var config = {
			stripeRows:true,
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
						singleSelect : true,
						listeners: {
							rowselect: function(sm, row, rec) {
//								Ext.getCmp('vg-print-btn').enable();
//								Ext.getCmp('vg-change-btn').enable();
	                        },
							scope:this
						}
					}),
			listeners: {
				rowdblclick:this.onPrint.createDelegate(this, [])
			},
			tbar:{
//				id:'patient-visit-tbl',
				xtype:'toolbar',
				//disabled:true,
				items:[{
					xtype:'splitbutton',
					iconCls:'med-usersetup',
					text:'Новый прием',
					handler:this.onCreate.createDelegate(this,['visit']),
					menu:{
						items:[{
							text:'Поступление биоматериала',
							iconCls:'med-testtubes',
							handler:this.onCreate.createDelegate(this,['material'])
						}]
					}
					
				},{
//					id:'vg-change-btn',
					xtype:'button',
					iconCls:'silk-pencil',
					text:'Изменить',
					//disabled:true,
					handler:this.onChange.createDelegate(this, [])
				},'-',{
					xtype:'button',
					text:'Пробирки',
					handler:this.onSamplingEdit.createDelegate(this, [])
				},'-',{
//					id:'barcode-print-btn',
					text:'Печать штрих-кодов',
					handler:this.printBarcode.createDelegate(this,[])
	        	},{
//					id:'sampling-print-btn',
					text:'Печать заказа',
					handler:this.toPrint.createDelegate(this,['sampling'])
	        	},{
//					id:'visit-print-btn',
					text:'Печать счета',
					handler:this.toPrint.createDelegate(this,['visit'])
	        	},'->',{
//	        		id:'office-toggle',
	        		xtype:'checkbox',
	        		boxLabel:'Документы своего офиса',
	        		handler:function(){
	        			this.storeFilter('office',Ext.getCmp('office-toggle').getValue() ? active_state_id : undefined);
	        		},
	        		scope:this
	        	}]
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
				forceFit : true,
				emptyText: 'Нет записей'
				//getRowClass : this.applyRowClass
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.VisitGrid.superclass.initComponent.apply(this, arguments);
		
		this.store.on('load',function(){
			this.getSelectionModel().selectFirstRow();
		},this);
		//this.ownerCt.ownerCt.on('patientselect', this.setActivePatient, this);
		//App.eventManager.on('patientselect', this.onPatientSelect, this);
	},
	
	onSamplingEdit: function(){
		var rec = this.getSelected();
		if(rec) {
			var win = new Ext.Window({
				width:800,
				height:550,
				layout:'fit',
				items:{
					xtype:'samplingeditor',
					visitId:rec.id
				},
				modal:true
			});
			win.show();
		}
	},
	
	onPrintAll: function(){
		this.toPrint('sampling');
		this.toPrint('visit');
		this.printBarcode();
	},
	
	printBarcode: function()
	{
		var bc_win;
		var record = this.getSelected(); 
		var visitId = record.id;
		bc_win = new App.barcode.PrintWindow({
			visitId:visitId,
			record:record
		});
		bc_win.show();
	},
	
	toPrint:function(slug){
		visitId = this.getSelected().id;
		var url = ['/visit/print',slug,visitId,''].join('/');
		window.open(url);
	},
	
	setActivePatient: function(rec) {
		id = rec.id;
		this.patientRecord = rec;
		this.patientId = id;
		var s = this.store;
		s.baseParams = {format:'json','patient': id};
		s.load();
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

	onCreate: function(type){
		if (this.patientRecord) {
			App.eventManager.fireEvent('launchapp','visittab',{
				patientRecord:this.patientRecord,
				type:type
			});
		}
	},
	
	onChange: function(){
		if (this.patientRecord) {
			var rec = this.getSelected();
			if (rec) {
				var type = rec.data.cls=='п' ? 'visit' : 'material'; /// TODO: тип формы надо определять как-то иначе
				App.eventManager.fireEvent('launchapp','visittab',{
					store:this.store,
					record:rec,
					patientRecord:this.patientRecord,
					type:type
				});
			}
		}
	},
	
	onPatientSelect: function(id) {
//		Ext.getCmp('patient-visit-tbl').enable();
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