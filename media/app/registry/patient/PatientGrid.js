Ext.ns('App','App.patient');

App.patient.PatientGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoLoad : false,
			apiUrl : get_api_url('patient'),
			model: App.models.Patient
		});
		
		if(App.settings.strictMode) {
			this.store.setBaseParam('state',active_state_id);
		}
		
		this.store.load();
		
		this.columns =  [
		    {
		    	header: "Фамилия", 
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'last_name'
		    },{
		    	header: "Имя", 
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'first_name'
		    },{
		    	header: "Отчество", 
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'mid_name'
		    },{
		    	header: "Д.р.", 
		    	width: 35, 
		    	sortable: true, 
		    	dataIndex: 'birth_day',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y')
		    }
		];		
		
		this.editButton = new Ext.Button({
			iconCls:'silk-pencil',
			text:'Изменить',
			disabled:true,
			handler:this.onPatientEdit.createDelegate(this),
			scope:this
		});
		
		this.cardButton = new Ext.menu.Item({
			text:'Амбулаторная карта',
			disabled:true,
			handler: this.goToSlug.createDelegate(this, ['print_card']),
			scope:this
		});
		this.contractButton = new Ext.menu.Item({
			text:'Договор',
			disabled:true,
			handler: this.goToSlug.createDelegate(this, ['contract']),
			scope:this
		});
		
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
                    	this.fireEvent('patientselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().loadRecord(rec);
                    	this.btnSetDisabled(false);
                    },
                    rowdeselect: function(sm, row, rec) {
                    	this.fireEvent('patientdeselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().reset();
                    	this.btnSetDisabled(true);
                    },
                    scope:this
                }
			}),
			tbar:[{
				xtype:'button',
				iconCls:'silk-add',
				text:'Новый пациент',
				handler:this.onPatientAdd.createDelegate(this, [])
			},this.editButton,{
				text:'>',
				handler:function(){
					var rec = this.getSelectionModel().getSelected();
					App.eventManager.fireEvent('launchapp','patientcard',{
						record:rec
					});
				},
				scope:this
			},'->',{
				iconCls:'silk-bullet-wrench',
				menu:[this.cardButton,this.contractButton]
			}],
	        bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Записи {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			viewConfig : {
				forceFit : true
				//getRowClass : this.applyRowClass
			},	
			listeners: {
				rowdblclick:this.onPatientEdit.createDelegate(this),
				scope:this
			}
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.PatientGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		App.eventManager.on('visitcreate', this.onVisitCreate, this);
//		App.eventManager.on('patientwrite', this.onPatientWrite, this);
		this.on('patientselect', this.onPatientSelect, this);
		this.store.on('write', this.onStoreWrite, this);
		this.on('destroy', function(){
		    App.eventManager.un('globalsearch', this.onGlobalSearch, this); 
		    App.eventManager.un('visitcreate', this.onVisitCreate, this);
		},this);
	},
	
	btnSetDisabled: function(status) {
        this.editButton.setDisabled(status);
        this.cardButton.setDisabled(status);
        this.contractButton.setDisabled(status);
	},
	
	onPatientSelect: function(){
//		this.btnSetDisable(false);
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	getAbsoluteUrl: function(id) {
		return "/admin/patient/patient/"+id+"/";
	},
	
	goToSlug: function(slug) {
		var s = this.getSelected().data.id;
		var url = this.getAbsoluteUrl(s)+slug+"/";
		window.open(url);
	},
	
	onGlobalSearch: function(v){
		var s = this.store;
//		s.baseParams = { format:'json' };
//		vi = parseInt(v);
//		if (!isNaN(vi)){
//			s.setBaseParam('visit_id', vi);
//		} else {
			s.setBaseParam('search', v);
//		}
		s.load();
	},
	
	onPatientAdd: function() {
		this.win = new App.patient.PatientWindow({
			store:this.store,
			scope:this,
			fn:function(record){
//				this.store.insertRecord(record);
			}
		});
		this.win.show();
		this.win.on('savecomplete', function(){
			this.win.close();
		},this);
	},
	
	onPatientEdit: function() {
		var record = this.getSelected();
		if(record) {
    		this.win = new App.patient.PatientWindow({
    			record:record,
    			store:this.store,
    			scope:this,
    			fn:function(record){
    			}
    		});
    		this.win.show();
    		this.win.on('savecomplete', function(){
    			this.win.close();
    		},this);
		}	
	},
	
	onStoreWrite: function(store, action, result, res, rs) {
		if( res.success && this.win ) {
			this.store.filter('id',rs.data.id);
			this.getSelectionModel().selectFirstRow();
			if(action=='create') {
//				App.eventManager.fireEvent('patientcreate',rs);
				this.fireEvent('patientselect',rs);
			}
			
		}
		
	},
	
	onVisitCreate: function(rs,patientId){
		delete this.store.baseParams['search'];
		if (patientId){
			this.store.load({params:{'id':App.uriToId(rs.data.patient)},callback:function(records){
				if (!records.length) return
				this.getSelectionModel().selectFirstRow();
				this.fireEvent('patientselect',records[0])
			},scope:this})
		}
	}
	
});



Ext.reg('patientgrid', App.patient.PatientGrid);