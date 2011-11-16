Ext.ns('App','App.calendar');

App.calendar.ServiceChoiceGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.serviceStore = new Ext.data.RESTStore({
			autoLoad : true,
			apiUrl : get_api_url('extendedservice'),
			model: [
				    {name: 'id'},
				    {name: 'resource_uri'},
				    {name: 'service_name'},
				    {name: 'state_name'},
				    {name: 'price'}
				]
		});
		
		this.columns =  [
		    {
		    	header: "Наименование", 
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'service_name'
		    },{
		    	header: "Место выполнения", 
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'state_name'
		    },{
		    	header: "Цена", 
		    	width: 45, 
		    	sortable: true, 
		    	dataIndex: 'price'
		    }
		];		
		
		
		this.choiceButton = new Ext.Button({
			iconCls:'silk-accept',
			disabled:true,
			text:'Выбрать',
			handler:this.onChoice.createDelegate(this, []),
			scope:this
		});
		
		this.searchField = new Ext.ux.form.SearchField({
            store: this.store ? this.store : this.serveceStore,
            paramName:'base_service__name__icontains'
        });
		
		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border: false,
			store : this.store ? this.store : this.serveceStore,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true,
				listeners: {
                    rowselect: function(sm, row, rec) {
                    	this.btnSetDisabled(false);
                    },
                    rowdeselect: function(sm, row, rec) {
                    	this.btnSetDisabled(true);
                    },
                    scope:this
                }
			}),
			tbar:[this.choiceButton,this.searchField],
	        bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store ? this.store : this.serveceStore,
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
		App.calendar.ServiceChoiceGrid.superclass.initComponent.apply(this, arguments);
	},
	
	btnSetDisabled: function(status) {
        this.choiceButton.setDisabled(status);
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	onChoice: function() {
        var record = this.getSelectionModel().getSelected();
        if (record) {
        	Ext.callback(this.fn, this.scope || window, [record]);
        };
    }
	
});



Ext.reg('servicechoicegrid', App.calendar.ServiceChoiceGrid);