Ext.ns('App','App.examination');

App.examination.PatientGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoLoad : true,
			apiUrl : get_api_url('patient'),
			model: App.models.Patient
		});
		
		this.historyBtn = new Ext.Button({
			visible:this.isCard,
			text: 'История пациента',
			handler:this.onHistoryOpen.createDelegate(this),
			scope:this
		});
		
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
			tbar:[this.historyBtn],
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
				rowdblclick:this.onHistoryOpen.createDelegate(this),
				scope:this
			}
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.PatientGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
//		App.eventManager.on('patientwrite', this.onPatientWrite, this);
		this.on('patientselect', this.onPatientSelect, this);
		
		this.on('destroy', function(){
		    App.eventManager.un('globalsearch', this.onGlobalSearch, this); 
		},this);
		
	},
	
	btnSetDisabled: function(status) {
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
			s.setBaseParam('search', v);
//		}
		s.load();
	},
	
	onHistoryOpen: function(){
		var patient = this.getSelected();
		if (!patient){
			return false
		};
		var name = patient.data.first_name + ' ' + patient.data.mid_name + ' ' + patient.data.last_name; 
		var short_name = patient.data.short_name + ': История ';
		config = {
			closable:true,
    		patient:patient.data.id,
    		patient_name: name,
    		title: short_name,
			staff:this.staff
		}
		App.eventManager.fireEvent('launchapp', 'patienthistory',config);
	}
	
});



Ext.reg('patientgrid', App.examination.PatientGrid);