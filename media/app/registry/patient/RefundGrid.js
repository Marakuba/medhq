Ext.ns('App.patient','App.registry');

App.patient.RefundGrid = Ext.extend(Ext.grid.GridPanel, {

	loadInstant: false,
	
	initComponent : function() {
		
		this.backend = new App.registry.RefundBackend({});
		
		this.store = this.backend.store;
		
		this.columns =  [{
		    	header: "№ возврата", 
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
		    },{
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
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
						singleSelect : true
					}),
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
			tbar:{
				xtype:'toolbar',
				items:[{
					xtype:'splitbutton',
					iconCls:'med-usersetup',
					text:'Возврат приема',
					handler:this.onCreate.createDelegate(this,['visit']),
					menu:{
						items:[{
							text:'Возврат поступления б/м',
							iconCls:'med-testtubes',
							handler:this.onCreate.createDelegate(this,['material'])
						}]
					}
					
				},{
					id:'vg-change-btn',
					xtype:'button',
					iconCls:'silk-pencil',
					text:'Изменить',
					handler:this.onChange.createDelegate(this, [])
				}]
			},
			view: new Ext.grid.GroupingView({
				forceFit : true
			})
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.RefundGrid.superclass.initComponent.apply(this, arguments);
		
		//App.eventManager.on('patientselect', this.onPatientSelect, this);
		this.ownerCt.on('patientselect', this.setActivePatient, this);
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},

	setActivePatient: function(rec) {
		id = rec.id;
		this.patientId = id;
		this.patientRecord = rec;
		var s = this.store;
		s.baseParams = {format:'json','order__patient': id};
		s.reload();
	},

	onCreate: function(type){
		if (this.patientId) {
			App.eventManager.fireEvent('refundcreate',this.patientId,type,false,this.patientRecord);
		}
	},
	
	onChange: function(){
		var rec = this.getSelected();
		if (rec) {
			var type = rec.data.cls=='п' ? 'visit' : 'material'; /// TODO: тип формы надо определять как-то иначе
			App.eventManager.fireEvent('refundcreate',this.patientId,type,rec.id,this.patientRecord);
		}
	}
	
	
});



Ext.reg('patientrefundgrid',App.patient.RefundGrid);