Ext.ns('App.patient, App.choices');

App.patient.VisitGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoLoad : false,
			apiUrl : get_api_url('visit'),
			model: App.models.visitModel
		});
		
		this.columns =  [
		    {
		    	width: 30, 
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
		    },{
		    	header: "№ заказа", 
		    	width: 65, 
		    	sortable: true, 
		    	dataIndex: 'barcode_id'
		    },{
		    	header: "Дата", 
		    	width: 100, 
		    	sortable: true, 
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y H:i')
		    },{
		    	header: "Сумма, руб.", 
		    	width: 80, 
		    	sortable: true, 
		    	dataIndex: 'total_price', 
		    	renderer: function(v,params,rec){
		    		if(rec.data.cls=='б'){
		    			return "---"
		    		} 
		    		return v-(rec.data.discount_value*v/100)
		    	}
		    },{
		    	header: "Скидка, %", 
		    	width: 70, 
		    	sortable: true, 
		    	dataIndex: 'discount_value', 
		    	renderer: function(v,params,rec){
		    		if(rec.data.cls=='б'){
		    			return "---"
		    		} 
		    		return v
		    	}
		    },{
		    	header: "Скидка, руб.", 
		    	width: 80, 
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
		    	width: 180, 
		    	sortable: true, 
		    	dataIndex: 'referral_name', 
		    	editor: new Ext.form.TextField({})
		    }/*,{
		    	header: "*", 
		    	width: 25, 
		    	sortable: true, 
		    	dataIndex: 'payment_type'
		    }*/,{
		    	header: "Офис", 
		    	width: 120, 
		    	sortable: true, 
		    	dataIndex: 'office_name' 
		    },{
		    	header: "Оператор", 
		    	width: 100, 
		    	sortable: true, 
		    	dataIndex: 'operator_name'
		    }
		];		
		
		this.materialBtn = {
			text:'Поступление биоматериала',
			iconCls:'med-testtubes',
			handler:this.onCreate.createDelegate(this,['material'])
		};
		
		this.completeBtn = {
			xtype:'splitbutton',
			iconCls:'med-usersetup',
			text:'Новый прием',
			handler:this.onCreate.createDelegate(this,['visit']),
			menu:{
				items:[this.materialBtn]
			}
			
		};
		
		this.barcodeEdtBtn = {
			text:'Изменить штрих-код',
			iconCls:'silk-pencil',
			handler:this.onBarcodeEdit,
			scope:this
		};
		
		this.ptypeEdtBtn = {
			text:'Изменить форму оплаты',
			iconCls:'silk-pencil',
			handler:this.onPtypeEdit,
			scope:this
		};
		
		this.editBtn = {
			xtype:'splitbutton',
			iconCls:'silk-pencil',
			text:'Изменить',
			handler:this.onChange.createDelegate(this, []),
			menu:{
				items:[this.barcodeEdtBtn, this.ptypeEdtBtn]
			}
			
		};
		
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
				rowdblclick:this.onPreview.createDelegate(this, [])
			},
			tbar:{
				xtype:'toolbar',
				items:[App.settings.strictMode ? this.materialBtn : this.completeBtn, 
				this.editBtn,'-',{
					xtype:'button',
					text:'Пробирки',
					handler:this.onSamplingEdit.createDelegate(this, [])
				},'-',{
					text:'Печать штрих-кодов',
					handler:this.printBarcode.createDelegate(this,[])
	        	},{
					text:'Печать заказа',
					handler:this.toPrint.createDelegate(this,['sampling'])
	        	},{
					text:'Печать счета',
					handler:this.toPrint.createDelegate(this,['visit'])
	        	},'->']
			},
	        bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			viewConfig : {
				emptyText: 'Нет записей'
				//getRowClass : this.applyRowClass
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.VisitGrid.superclass.initComponent.apply(this, arguments);
		
		this.store.on('load',function(){
			this.getSelectionModel().selectFirstRow();
		},this);
		
		this.store.on('write',function(){
		})
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
			record:record,
			patient:this.patientRecord
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
				patientId:this.patientRecord.data.id,
				hasPatient:true,
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
//					store:this.store,
					visitId:rec.data.id,
					hasPatient:true,
					patientId:this.patientRecord.data.id,
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
	},
	
	onBarcodeEdit: function(){
		var visitRecord = this.getSelected();
		if(!visitRecord) return false;
		
		this.barcodeWindow = new App.choices.BarcodeChoiceWindow({
			patientId:this.patientId,
			modal:true,
			fn:function(record){
				if (record){
					var barcode = record.data.resource_uri;
					visitRecord.set('barcode',barcode);
				};
				this.barcodeWindow.close();
			},
			scope:this
		});
		
		this.barcodeWindow.show();
	},
	
	onPtypeEdit: function(){
		var visitRecord = this.getSelected();
		if(!visitRecord) return false
		var win = new App.choices.PaymentTypeChoiceWindow({
			patientRecord:this.patientRecord,
			patientId:this.patientId,
			record:visitRecord,
			listeners:{
				scope:this,
				ptypechoiced:function(){
					App.eventManager.fireEvent('patientcardupdate',this.patientId)
				}
			}
		});
		win.show();
	},
	
	onPreview: function(){
		var visit = this.getSelected();
		var previewWindow = new Ext.Window({
			modal:true,
			closable:true,
			title:String.format('{0}, прием №{1}',visit.data.patient_name, visit.data.barcode_id),
			height:600,
			layout:'fit',
			width:800,
			tbar:[{
				xtype:'button',
				iconCls:'silk-printer',
				text:'Печать счета',
				handler:this.toPrint.createDelegate(this,['visit'])
			},'-',{
				text:'Печать заказа',
				handler:this.toPrint.createDelegate(this,['sampling'])
        	}],
			items:[{
				xtype:'panel',
				autoScroll:true,
				border:false,
				layout:'fit',
				autoLoad:String.format('/widget/visit/{0}/',visit.data.id)
			}]
		});
		
		previewWindow.show();
	}
	
});


Ext.reg('patientvisitgrid', App.patient.VisitGrid);