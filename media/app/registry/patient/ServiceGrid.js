Ext.ns('App.patient');

App.patient.ServiceGrid = Ext.extend(Ext.grid.GridPanel, {

	loadInstant: false,

	initComponent : function() {

		// Create a standard HttpProxy instance.
		this.proxy = new Ext.data.HttpProxy({
		    url: App.utils.getApiUrl('visit','orderedservice')
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
		    {name: 'barcode'},
		    {name: 'laboratory'},
		    {name: 'visit_id', allowBlank: true},
		    {name: 'staff', convert:function(v,rec){
		    	return v ? v.name : '---';
		    }}
		]);

		// The new DataWriter component.
		this.writer = new Ext.data.JsonWriter({
		    encode: false   // <-- don't return encoded JSON -- causes Ext.Ajax#request to send data using jsonData config rather than HTTP params
		});

		this.store = new Ext.data.GroupingStore({
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
			groupField:'visit_id',
			remoteSort: true,
			sortInfo:{
				field: 'laboratory',
				direction: "desc"
			},
		    restful: true,     // <-- This Store is RESTful
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer    // <-- plug a DataWriter into the store just as you would a Reader
		});


		this.columns =  [
		    {
		    	header: "Визит",
		    	width: 50,
		    	sortable: true,
		    	dataIndex: 'visit_id',
		    	hidden:true
		    },{
		    	header: "BC",
		    	width: 15,
		    	sortable: true,
		    	dataIndex: 'barcode',
		    	hidden:true
		    },{
		    	header:'Где выполняется',
		    	width:30,
		    	sortable:true,
		    	dataIndex:'laboratory'
		    },{
		    	header: "Дата",
		    	width: 50,
		    	sortable: true,
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y')
		    },{
		    	header: "Услуга",
		    	width: 50,
		    	sortable: true,
		    	dataIndex: 'service_name'
		    },{
		    	header: "Врач",
		    	width: 50,
		    	sortable: true,
		    	dataIndex: 'staff'
		    },{
		    	header: "Стоимость",
		    	width: 50,
		    	sortable: true,
		    	hidden: App.settings.strictMode,
		    	dataIndex: 'price'
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
	            pageSize: 100,
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
			view: new Ext.grid.GroupingView({
				forceFit : true,

				//getRowClass : this.applyRowClass
			})

		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.ServiceGrid.superclass.initComponent.apply(this, arguments);

		//WebApp.on('patientselect', this.onPatientSelect, this);
		this.ownerCt.on('patientselect', this.setActivePatient, this);
	},

	setActivePatient: function(rec) {
		id = rec.id;
		this.patientId = id;
		var s = this.store;
		s.baseParams = {format:'json','order__patient': id};
		s.load();
	}


});



Ext.reg('patientservicegrid',App.patient.ServiceGrid);
