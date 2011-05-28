Ext.ns('App.patient');

App.patient.LabGrid = Ext.extend(Ext.grid.GridPanel, {

	loadInstant: false,
	
	initComponent : function() {
		
		// Create a standard HttpProxy instance.
		this.proxy = new Ext.data.HttpProxy({
		    url: '/dashboard/api/v1/laborder'
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
		    {name: 'lab_name'},
		    {name: 'staff_name'}
		]);
		
		// The new DataWriter component.
		this.writer = new Ext.data.JsonWriter({
		    encode: false   // <-- don't return encoded JSON -- causes Ext.Ajax#request to send data using jsonData config rather than HTTP params
		});
		
		this.store = new Ext.data.Store({
		    id: 'laborder-store',
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
		    {
		    	width: 1, 
		    	sortable: true, 
		    	dataIndex: 'is_completed', 
		    	renderer: function(val) {
		    		flag = val ? 'yes' : 'no';
		    		return "<img src='/media/admin/img/admin/icon-"+flag+".gif'>"
		    	}
		    	//editor: new Ext.form.TextField({})
		    },{
		    	header: "Дата", 
		    	width: 100, 
		    	sortable: true, 
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y'), 
		    	editor: new Ext.form.TextField({})
		    },{
		    	//width: 1, 
		    	sortable: true, 
		    	header:'Напечатано',
		    	dataIndex: 'is_printed', 
		    	renderer: function(val) {
		    		flag = val ? 'yes' : 'no';
		    		return "<img src='/media/admin/img/admin/icon-"+flag+".gif'>"
		    	}
		    	//editor: new Ext.form.TextField({})
		    },{
		    	header: "Дата/время печати", 
		    	width: 100, 
		    	sortable: true, 
		    	dataIndex: 'print_date',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y') 
		    	//editor: new Ext.form.TextField({})
		    },{
		    	header: "Лаборатория", 
		    	width: 100, 
		    	sortable: true, 
		    	dataIndex: 'lab_name'
		    },{
		    	header: "Врач", 
		    	width: 100, 
		    	sortable: true, 
		    	dataIndex: 'staff_name'
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
				handler:this.goToSlug.createDelegate(this, ['print_results'])
			}],
			listeners: {
				rowdblclick:this.goToSlug.createDelegate(this, ['print_results'])
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
		App.patient.LabGrid.superclass.initComponent.apply(this, arguments);
		this.ownerCt.on('patientselect', this.setActivePatient, this);
		//App.eventManager.on('patientselect', this.onPatientSelect, this);
	},
	
	setActivePatient: function(id) {
		this.patientId = id;
		var s = this.store;
		s.baseParams = {format:'json','visit__patient': id};
		s.reload();
	},
	
	onPatientSelect: function(id) {
		this.store.load({
			params: {
				'visit__patient': id //rec.data.id
			}
		});
	},

	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	getAbsoluteUrl: function(id) {
		return "/lab/laborder/"+id+"/";
	},
	
	goToSlug: function(slug) {
		var s = this.getSelected().data.id;
		var url = this.getAbsoluteUrl(s)+slug+"/";
		window.open(url);
	},

	
});



Ext.reg('patientlabgrid',App.patient.LabGrid);