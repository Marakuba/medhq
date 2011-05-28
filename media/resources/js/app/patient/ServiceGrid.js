Ext.ns('App.patient');

App.patient.ServiceGrid = Ext.extend(Ext.grid.GridPanel, {

	loadInstant: false,
	
	initComponent : function() {
		
		// Create a standard HttpProxy instance.
		this.proxy = new Ext.data.HttpProxy({
		    url: '/dashboard/api/v1/orderedservice'
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
		    {name: 'created', allowBlank: false, type:'date'},
		    {name: 'service_name', allowBlank: false},
		    {name: 'price', allowBlank: false},
		    //{name: 'is_printed', allowBlank: false, type:'boolean'}
		]);
		
		// The new DataWriter component.
		this.writer = new Ext.data.JsonWriter({
		    encode: false   // <-- don't return encoded JSON -- causes Ext.Ajax#request to send data using jsonData config rather than HTTP params
		});
		
		this.store = new Ext.data.Store({
		    id: 'orderedservice-store',
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
		
		
		this.columns =  [
		    /*{
		    	header: "№ заказа", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'id',
		    	renderer:function zeroPad(num){ return ((num/Math.pow(10,5))+'').slice(2) }, 
		    	editor: new Ext.form.TextField({})
		    },*/{
		    	header: "Дата", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y'), 
		    	editor: new Ext.form.TextField({})
		    },{
		    	header: "Услуга", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'service_name' 
		    	//editor: new Ext.form.TextField({})
		    },{
		    	header: "Стоимость", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'price' 
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
			viewConfig : {
				forceFit : true
				//getRowClass : this.applyRowClass
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.ServiceGrid.superclass.initComponent.apply(this, arguments);
		
		//App.eventManager.on('patientselect', this.onPatientSelect, this);
		this.ownerCt.on('patientselect', this.setActivePatient, this);
	},
	
	setActivePatient: function(id) {
		this.patientId = id;
		var s = this.store;
		s.baseParams = {format:'json','order__patient': id};
		s.reload();
	}
	
	
});



Ext.reg('patientservicegrid',App.patient.ServiceGrid);