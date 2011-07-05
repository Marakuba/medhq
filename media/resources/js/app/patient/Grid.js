Ext.ns('App');

App.PatientGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		// Create a standard HttpProxy instance.
		this.proxy = new Ext.data.HttpProxy({
		    url: '/dashboard/api/v1/patient'
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
		    {name: 'first_name', allowBlank: false},
		    {name: 'mid_name', allowBlank: true},
		    {name: 'last_name', allowBlank: false},
		    {name: 'gender', allowBlank: false},
		    {name: 'mobile_phone', allowBlank: true},
		    {name: 'home_address_street', allowBlank: true},
		    {name: 'email', allowBlank: true},
		    {name: 'insurance_doc', allowBlank: true},
		    {name: 'birth_day', allowBlank: false, type:'date'} 
		]);
		
		// The new DataWriter component.
		this.writer = new Ext.data.JsonWriter({
		    encode: false   // <-- don't return encoded JSON -- causes Ext.Ajax#request to send data using jsonData config rather than HTTP params
		});
		this.baseParams = {
		    	format:'json'
		}; 
		this.store = new Ext.data.Store({
		    id: 'patient-store',
		    baseParams: this.baseParams,
		    paramNames: {
			    start : 'offset',  // The parameter name which specifies the start row
			    limit : 'limit',  // The parameter name which specifies number of rows to return
			    sort : 'sort',    // The parameter name which specifies the column to sort on
			    dir : 'dir'       // The parameter name which specifies the sort direction
			},
		    restful: true,
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer,    
		    listeners: {
		    	write: function(store, action, result, res, rs) {
		    		App.eventManager.fireEvent('patientwrite',rs);
		    	}
		    }
		});
		
		this.store.on('load', function(){
			this.getSelectionModel().selectFirstRow();
		}, this);
		
		this.columns =  [
		    /*{
		    	header: "ID", 
		    	width: 15, 
		    	sortable: true, 
		    	dataIndex: 'id'
		    },*/{
		    	header: "Фамилия", 
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'last_name', 
		    	editor: new Ext.form.TextField({})
		    },{
		    	header: "Имя", 
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'first_name', 
		    	editor: new Ext.form.TextField({})
		    },{
		    	header: "Отчество", 
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'mid_name', 
		    	editor: new Ext.form.TextField({})
		    },{
		    	header: "Д.р.", 
		    	width: 35, 
		    	sortable: true, 
		    	dataIndex: 'birth_day',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y')
		    }
		];		
		
		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border: false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
						singleSelect : true,
						listeners: {
	                        rowselect: function(sm, row, rec) {
	                            Ext.getCmp("patient-quick-form").getForm().loadRecord(rec);
	                        }
	                    }
					}),
			listeners:{
				rowdblclick: function(grid,index,e) {
					rec = grid.store.getAt(index);
					this.fireEvent('patientselect', rec);
				},
				scope:this
			},
			tbar:[{
				xtype:'button',
				iconCls:'silk-add',
				text:'Новый пациент',
				handler:this.onPatientAdd.createDelegate(this, [])
			},{
				id:'change-btn',
				xtype:'button',
				iconCls:'silk-pencil',
				text:'Изменить',
				disabled:true,
				handler:this.onPatientEdit.createDelegate(this, [])
			},'->',{
				id:'amb-card-btn',
				xtype:'button',
				text:'Амбулаторная карта',
				disabled:true,
				handler: this.goToSlug.createDelegate(this, ['print_card'])
			},{
				id:'contract-btn',
				xtype:'button',
				text:'Договор',
				disabled:true,
				handler: this.goToSlug.createDelegate(this, ['contract'])
			}],
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
		App.PatientGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		App.eventManager.on('patientwrite', this.onPatientWrite, this);
		this.on('patientselect', this.onPatientSelect, this);
	},
	
	afterRender: function(){
		App.PatientGrid.superclass.afterRender.call(this, arguments);
		this.store.load();
	},
	
	onPatientSelect: function(){
		Ext.getCmp('amb-card-btn').enable();
		Ext.getCmp('contract-btn').enable();
		//Ext.getCmp('change-btn').enable();
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	getAbsoluteUrl: function(id) {
		return "/patient/patient/"+id+"/";
	},
	
	goToSlug: function(slug) {
		var s = this.getSelected().data.id;
		var url = this.getAbsoluteUrl(s)+slug+"/";
		window.open(url);
	},
	
	onGlobalSearch: function(v){
		var s = this.store;
		s.baseParams = { format:'json' };
		if (typeof(v)=='number') {
			s.setBaseParam('id__exact', parseInt(v));
		} else if (typeof(v)=='string') {
			s.setBaseParam('last_name__istartswith', v);
		}
		s.reload();
		if (typeof(v)=='number') {
			this.getSelectionModel().selectRow(0);
		}
	},
	
	onPatientAdd: function() {
		this.win = new App.PatientWindow({
			store:this.store
		});
		this.win.show(this);
	},
	
	onPatientEdit: function() {
		var rec = this.getSelected();
		this.win = new App.PatientWindow({
			store:this.store,
			instance: rec
		});
		this.win.show(this);
	},
	
	onPatientWrite: function(rs) {
		if (this.win) {
			this.win.close();
			var id = parseInt(rs.data.id);
			var gsf = Ext.getCmp('gsearch-fld'); 
			gsf.setValue(id);
			gsf.onTrigger2Click();
			App.eventManager.fireEvent('globalsearch',id);
			App.eventManager.fireEvent('patientselect',id);
		}
	}
	
});



Ext.reg('patientgrid',App.PatientGrid);