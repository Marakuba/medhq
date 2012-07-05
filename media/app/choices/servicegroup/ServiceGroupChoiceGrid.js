Ext.ns('App','App.choices');

App.choices.ServiceGroupChoiceGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoLoad : true,
			apiUrl : get_api_url('baseservicegroup'),
			model: App.models.BaseService
		});
		
		this.columns =  [
		    {
		    	header: "Наименование", 
		    	sortable: true, 
		    	dataIndex: 'name'
		    },{
		    	header: "Код", 
		    	width: 30, 
		    	sortable: true, 
		    	dataIndex: 'code'
		    }
		];		
		
		this.choiceButton = new Ext.Button({
			iconCls:'silk-accept',
			disabled:true,
			text:'Выбрать',
			handler:this.onChoice.createDelegate(this, []),
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
                    	this.fireEvent('servicegroupselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().loadRecord(rec);
                    	this.btnSetDisabled(false);
                    },
                    rowdeselect: function(sm, row, rec) {
                    	this.fireEvent('servicegroupdeselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().reset();
                    	this.btnSetDisabled(true);
                    },
                    scope:this
                }
			}),
			tbar:[this.choiceButton,
			{
				xtype:'gsearchfield',
				stripCharsRe:new RegExp('[\;\?]')
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
				rowdblclick:this.onChoice.createDelegate(this, []),
				scope:this
			}
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.choices.ServiceGroupChoiceGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		this.on('destroy', function(){
			App.eventManager.un('globalsearch', this.onGlobalSearch, this);
		},this);
//		App.eventManager.on('patientwrite', this.onPatientWrite, this);
		this.on('servicegroupselect', this.onServiceGroupSelect, this);
		//this.store.on('write', this.onStoreWrite, this);
	},
	
	btnSetDisabled: function(status) {
        this.choiceButton.setDisabled(status);
	},
	
	onServiceGroupSelect: function(){
//		this.btnSetDisable(false);
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	onGlobalSearch: function(v){
		var s = this.store;
		s.baseParams = { format:'json' };
		s.setBaseParam('name__icontains', v);
		s.load();
	},
	
	onStoreWrite: function(store, action, result, res, rs) {
		if( res.success && this.win ) {
			store.filter('id',rs.data.id);
			this.getSelectionModel().selectFirstRow();
			this.fireEvent('servicegroupselect',rs);
		}
//		if(action=='create') {
//			App.eventManager.fireEvent('patientcreate',rs);
//		}
	},
	
	onChoice: function() {
        var record = this.getSelectionModel().getSelected();
        if (record) {
        	Ext.callback(this.fn, this.scope || window, [record]);
        };
    }
	
});

