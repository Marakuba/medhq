Ext.ns('App.patient');

App.patient.RefundGrid = Ext.extend(Ext.grid.GridPanel, {

	loadInstant: false,
	
	initComponent : function() {
		
		// Create a standard HttpProxy instance.
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('refund')
		});
		
		// Typical JsonReader.  Notice additional meta-data params for defining the core attributes of your json-response
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    //successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects'
		    //messageProperty: 'message'  // <-- New "messageProperty" meta-data
		}, [
		    {name: 'id'},
		    {name: 'created', type:'date',format:'c', allowBlank: true},
		    {name: 'cls', allowBlank: false},
		    {name: 'patient', allowBlank: false},
		    {name: 'patient_id', allowBlank: true},
		    {name: 'referral', allowBlank: true},
		    {name: 'source_lab', allowBlank: true},
		    {name: 'discount_value', allowBlank: true},
		    {name: 'total_price', allowBlank: true},
		    {name: 'total_paid', allowBlank: true},
		    {name: 'office_name', allowBlank: true},
		    {name: 'operator_name', allowBlank: true},
		    {name: 'patient_name', allowBlank: true},
		    {name: 'is_billed', allowBlank: true, type:'boolean'},
		    {name: 'referral_name', allowBlank: true}
		]);
		
		// The new DataWriter component.
		this.writer = new Ext.data.JsonWriter({
		    encode: false   // <-- don't return encoded JSON -- causes Ext.Ajax#request to send data using jsonData config rather than HTTP params
		});
		
		this.store = new Ext.data.GroupingStore({
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
		    writer: this.writer    // <-- plug a DataWriter into the store just as you would a Reader
		});
		
		
		this.columns =  [{
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
		    		return "<img src='"+MEDIA_URL+"resources/css/icons/"+icon+"' title='"+alt+"'>"
		    	}
		    },{
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