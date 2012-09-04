Ext.ns('App','App.choices');

App.choices.ReferralChoiceGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoLoad : true,
			apiUrl : get_api_url('referral'),
			model: [
				    {name: 'id'},
				    {name: 'resource_uri'},
				    {name: 'referral_type'},
				    {name: 'referral_type_name'},
				    {name: 'name'}
				]
		});
		
		this.columns =  [
		    {
		    	header: "Реферрал",
		    	sortable: true, 
		    	dataIndex: 'name'
		    },
		    {
		    	header: "Тип реферрала",
		    	sortable: true, 
		    	dataIndex: 'referral_type_name'
		    }
		];		
		
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
                    	this.fireEvent('referralselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().loadRecord(rec);
                    	this.btnSetDisabled(false);
                    },
                    rowdeselect: function(sm, row, rec) {
                    	this.fireEvent('referraldeselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().reset();
                    	this.btnSetDisabled(true);
                    },
                    scope:this
                }
			}),
			tbar:[this.choiceButton,
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
		App.choices.ReferralChoiceGrid.superclass.initComponent.apply(this, arguments);
//		App.eventManager.on('patientwrite', this.onPatientWrite, this);
		this.on('referralselect', this.onReferralSelect, this);
		//this.store.on('write', this.onStoreWrite, this);
	},
	
	btnSetDisabled: function(status) {
        this.choiceButton.setDisabled(status);
	},
	
	onReferralSelect: function(){
//		this.btnSetDisable(false);
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	onSearch: function(v){
		var s = this.store;
		s.baseParams = { format:'json' };
		s.setBaseParam('name__istartswith', v);
		s.load();
	},
	
	onStoreWrite: function(store, action, result, res, rs) {
		if( res.success && this.win ) {
			store.filter('id',rs.data.id);
			this.getSelectionModel().selectFirstRow();
			this.fireEvent('referralselect',rs);
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

