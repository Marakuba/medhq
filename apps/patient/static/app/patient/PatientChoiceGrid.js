Ext.ns('App','App.choices');

App.choices.PatientChoiceGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoLoad : true,
			apiUrl : get_api_url('patient'),
			model: [
				    {name: 'id'},
				    {name: 'resource_uri'},
				    {name: 'first_name', allowBlank: false},
				    {name: 'mid_name'},
				    {name: 'short_name'},
				    {name: 'last_name', allowBlank: false},
				    {name: 'gender', allowBlank: false},
				    {name: 'mobile_phone'},
				    {name: 'home_address_street'},
				    {name: 'email'},
				    {name: 'birth_day', allowBlank: false, type:'date'},
				    {name: 'discount'},
				    {name: 'discount_name'},
				    {name: 'client_item'},
				    {name: 'balance'},
				    {name: 'initial_account'},
				    {name: 'billed_account'},
				    {name: 'doc'},
				    {name: 'hid_card'}
				]
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
		
		this.editButton = new Ext.Button({
			iconCls:'silk-pencil',
			text:'Изменить',
			disabled:true,
			handler:this.onPatientEdit.createDelegate(this),
			scope:this
		});
		
		this.choiceButton = new Ext.Button({
			iconCls:'silk-accept',
			disabled:true,
			text:'Выбрать',
			handler:this.onChoice.createDelegate(this, []),
			scope:this
		});
		
		this.searchField = new App.SearchField({
			stripCharsRe:new RegExp('[\;\?]'),
			listeners:{
				scope:this,
				specialkey:function(f,e){
					if(e.getKey() == e.ENTER){
		                this.searchField.onTrigger2Click(f);
		            }
				},
				search:function(v){
					this.onSearch(v)
				}
				
			},
			onTrigger1Click : function(){
		        if(this.hasSearch){
		        	this.fireEvent('search',undefined)
					this.el.dom.value = '';
		            this.triggers[0].hide();
		            this.hasSearch = false;
					this.focus();
		        }
		    },
		    onTrigger2Click : function(){
		        var v = this.getRawValue();
		        if(v.length < 1){
		            this.onTrigger1Click();
		            return;
		        };
		        this.fireEvent('search',v)
		        this.hasSearch = true;
		        this.triggers[0].show();
				this.focus();
		    },
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
			tbar:[this.choiceButton,{
				xtype:'button',
				iconCls:'silk-add',
				text:'Новый пациент',
				handler:this.onPatientAdd.createDelegate(this, [])
			},this.editButton,
			this.searchField],
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
				rowdblclick:this.onChoice.createDelegate(this, []),
				scope:this
			}
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.choices.PatientChoiceGrid.superclass.initComponent.apply(this, arguments);
		WebApp.on('globalsearch', this.onGlobalSearch, this);
		this.on('destroy', function(){
			WebApp.un('globalsearch', this.onGlobalSearch, this);
		},this);
//		WebApp.on('patientwrite', this.onPatientWrite, this);
		this.on('patientselect', this.onPatientSelect, this);
		//this.store.on('write', this.onStoreWrite, this);
	},
	
	btnSetDisabled: function(status) {
        this.editButton.setDisabled(status);
        this.choiceButton.setDisabled(status);
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
	
	onSearch: function(v){
		var s = this.store;
		s.baseParams = { format:'json' };
		s.setBaseParam('search', v);
		s.load();
	},
	
	onPatientAdd: function() {
		this.win = new App.patient.PatientWindow({
			//store:this.store,
			scope:this,
			fn:function(record){
				Ext.callback(this.fn, this.scope || window, [record]);
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
			store.filter('id',rs.data.id);
			this.getSelectionModel().selectFirstRow();
			this.fireEvent('patientselect',rs);
		}
//		if(action=='create') {
//			WebApp.fireEvent('patientcreate',rs);
//		}
	},
	
	onChoice: function() {
        var record = this.getSelectionModel().getSelected();
        if (record && this.fn) {
        	Ext.callback(this.fn, this.scope || window, [record]);
        };
    }
	
});

