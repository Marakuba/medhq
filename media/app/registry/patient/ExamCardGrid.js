Ext.ns('App.patient');

App.patient.ExamCardGrid = Ext.extend(Ext.grid.GridPanel, {

	loadInstant: false,

	initComponent : function() {

		// Create a standard HttpProxy instance.
		this.proxy = new Ext.data.HttpProxy({
		    url: App.getApiUrl('card')
		});

		// Typical JsonReader.  Notice additional meta-data params for defining the core attributes of your json-response
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    //successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects'
		    //messageProperty: 'message'  // <-- New "messageProperty" meta-data
		}, App.models.Card);

		// The new DataWriter component.
		this.writer = new Ext.data.JsonWriter({
		    encode: false   // <-- don't return encoded JSON -- causes Ext.Ajax#request to send data using jsonData config rather than HTTP params
		});

		this.store = new Ext.data.Store({
		    id: 'regexam-store',
		    baseParams: {
		    	format:'json'
		    },
		    paramNames: {
			    start : 'offset',  // The parameter name which specifies the start row
			    limit : 'limit',  // The parameter name which specifies number of rows to return
			    sort : 'sort',    // The parameter name which specifies the column to sort on
			    dir : 'dir'       // The parameter name which specifies the sort direction
			},
			remoteSort: true,
		    restful: true,     // <-- This Store is RESTful
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer    // <-- plug a DataWriter into the store just as you would a Reader
		});


		this.columns =  [{
	    	header: "Дата",
	    	width: 10,
	    	sortable: true,
	    	dataIndex: 'created',
	    	renderer:Ext.util.Format.dateRenderer('d.m.Y')
	    },{
	    	header: "Услуга",
	    	width: 50,
	    	sortable: true,
	    	dataIndex: 'name'
	    },{
	    	header: "Врач",
	    	width: 30,
	    	sortable: true,
	    	dataIndex: 'staff_name'
	    }];

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
			view: new Ext.grid.GridView({
				forceFit : true
			})

		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.ExamCardGrid.superclass.initComponent.apply(this, arguments);

		//App.eventManager.on('patientselect', this.onPatientSelect, this);
		//this.ownerCt.on('patientselect', this.setActivePatient, this);
	},

	setActivePatient: function(rec) {
		id = rec.id;
		this.patientId = id;
		var s = this.store;
		s.baseParams = {
			format:'json',
			'ordered_service__order__patient': id,
			deleted:false
		};
		s.load();
	},

    getSelected: function() {
		return this.getSelectionModel().getSelected()
	},

	onPrint : function(){
		var record = this.getSelected();
		if(record) {
			window.open('/exam/card/'+record.data.id+'/');
		}
	}


});



Ext.reg('regexamgrid',App.patient.ExamCardGrid);
