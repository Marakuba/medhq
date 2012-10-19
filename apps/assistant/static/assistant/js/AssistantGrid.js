Ext.ns('App.assistant');

App.assistant.AssistantGrid = Ext.extend(Ext.grid.GridPanel, {
	
	pageSize : 20,
	
	nameColumnHeader : "Врач",
	
	titleColumnHeader: "Должность",

	departmentColumnHeader: "Отделение",
	
	choiceButtonText : 'Выбрать',

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoLoad : true,
			apiUrl : get_api_url('position'),
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
				    {name: 'name'},
				    {name: 'title'},
				    {name: 'department'}
				]
		});
		
		this.columns =  [
		    {
		    	header: this.nameColumnHeader, 
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'name'
		    },{
		    	header: this.titleColumnHeader, 
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'title'
		    },{
		    	header: this.departmentColumnHeader, 
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'department'
		    }
		];		
		
		this.choiceButton = new Ext.Button({
			iconCls:'silk-accept',
			disabled:true,
			text:this.choiceButtonText,
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
                    	this.fireEvent('staffselect', rec);
                    	this.btnSetDisabled(false);
                    },
                    rowdeselect: function(sm, row, rec) {
                    	this.fireEvent('staffdeselect', rec);
                    	this.btnSetDisabled(true);
                    },
                    scope:this
                }
			}),
			tbar:[this.choiceButton,this.searchField],
	        bbar: new Ext.PagingToolbar({
	            pageSize: this.pageSize,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Записи {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			viewConfig : {
				forceFit : true
			},	
			listeners: {
				rowdblclick:this.onChoice.createDelegate(this, []),
				scope:this
			}
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.assistant.AssistantGrid.superclass.initComponent.apply(this, arguments);
	},
	
	btnSetDisabled: function(status) {
        this.choiceButton.setDisabled(status);
	},
	
	onSearch: function(v){
		var s = this.store;
		s.baseParams = { format:'json' };
		s.setBaseParam('search', v);
		s.load();
	},
	
	onChoice: function() {
        var record = this.getSelectionModel().getSelected();
        if (record && this.fn) {
        	Ext.callback(this.fn, this.scope || window, [record]);
        };
    }
	
});

