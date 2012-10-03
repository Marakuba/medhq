Ext.ns('App.patient');

App.patient.LabGrid = Ext.extend(Ext.grid.GridPanel, {

	loadInstant: false,
	
	initComponent : function() {
		
		// Create a standard HttpProxy instance.
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('laborder')
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
		    {name: 'is_completed', allowBlank: false, type:'boolean'},
		    {name: 'is_printed', allowBlank: false, type:'boolean'},
		    {name: 'print_date', allowBlank: false, type:'date'},
		    {name: 'barcode'},
		    {name: 'manual_service'},
		    {name: 'laboratory_name'},
		    {name: 'staff_name'},
		    {name: 'payer_name'}
		]);
		
		// The new DataWriter component.
		this.writer = new Ext.data.JsonWriter({
		    encode: false   // <-- don't return encoded JSON -- causes Ext.Ajax#request to send data using jsonData config rather than HTTP params
		});
		
		this.store = new Ext.data.Store({
		    id: 'laborder-store',
		    baseParams: {
		    	format:'json',
//		    	is_manual:false
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
	    	header: "№ заказа", 
	    	width: 90, 
	    	sortable: false, 
	    	dataIndex: 'is_completed', 
	    	renderer: function(val, opts, rec) {
	    		var cls = val ? "cell-completed-icon" : "";
	    		return String.format('<div class="{0}" style="pagging-left:18px;text-indent:16px;">{1}</div>',cls,rec.data.barcode);
	    	}
	    },{
		    	header: "Дата", 
		    	width: 70, 
		    	sortable: true, 
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.y'), 
		    	editor: new Ext.form.TextField({})
		    },{
		    	header: "Лаборатория", 
		    	width: 130, 
		    	sortable: true, 
		    	dataIndex: 'laboratory_name'
		    },{
		    	header: "Исследование", 
		    	width: 170, 
		    	sortable: true, 
		    	dataIndex: 'manual_service'
		    },{
		    	width: 130,
		    	sortable: true, 
		    	header:'Напечатано',
		    	dataIndex: 'is_printed', 
		    	renderer: function(val,opts,rec) {
		    		if(val){
			    		time = Ext.util.Format.date(rec.data.print_date, 'd.m.y / H:i');
			    		return String.format('{0}&nbsp;&nbsp;<img src="{1}admin/img/admin/icon-yes.gif">', time, MEDIA_URL)
		    		}		    	
		    	}
		    },{
		    	header: "Врач", 
		    	width: 160, 
		    	sortable: true, 
		    	dataIndex: 'staff_name'
		    },{
		    	header: "Плательщик", 
		    	width: 130, 
		    	sortable: true, 
		    	dataIndex: 'payer_name'
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
	        tbar:[{
				xtype:'button',
				iconCls:'silk-printer',
				text:'Печать',
				handler:this.onPrint.createDelegate(this, [])
			}],
			listeners: {
				rowdblclick:this.onPrint.createDelegate(this, [])
			},
			bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			viewConfig : {
				emptyText: 'Нет записей',
				getRowClass : this.applyRowClass
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.LabGrid.superclass.initComponent.apply(this, arguments);
		this.ownerCt.on('patientselect', this.setActivePatient, this);
		//App.eventManager.on('patientselect', this.onPatientSelect, this);
	},
	
	applyRowClass : function(record, index){
		// x-grid-row-normal
		if(record.data.is_completed){
			return "x-grid-row-normal"
		}
		return ""
	},
	
	setActivePatient: function(rec) {
		id = rec.id;
		this.patientId = id;
		var s = this.store;
		s.setBaseParam('visit__patient', id);
		s.load();
	},
	
	onPatientSelect: function(id) {
		this.store.load({
			params: {
				'patient': id //rec.data.id
			}
		});
	},

	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	getAbsoluteUrl: function(id) {
		return "/lab/laborder/"+id+"/";
	},
	
	onPrint: function() {
		var id = this.getSelected().data.id;
		var url = ['/lab/print/results',id,''].join('/');
		window.open(url);
	},
	
	goToSlug: function(slug) {
		var s = this.getSelected().data.id;
		var url = this.getAbsoluteUrl(s)+slug+"/";
		window.open(url);
	}

	
});



Ext.reg('patientlabgrid',App.patient.LabGrid);