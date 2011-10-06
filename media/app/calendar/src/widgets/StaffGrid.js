
Ext.ns('Ext.calendar');
Ext.calendar.StaffGrid = Ext.extend(Ext.grid.GridPanel, {
    initComponent : function() {
		
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('possched')
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'name'},
		    {name: 'title'},
		    {name: 'department'}
		]);

		this.store = new Ext.data.Store({
			autoLoad:true,
		    baseParams: {
		    	format:'json'
		    },
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
		    restful: true,
		    proxy: this.proxy,
		    reader: this.reader
		});
		
		this.columns =  [{
		    	header: "Врачи", 
		    	//width: 8,
				//anchor:'100%',
		    	sortable: true, 
		    	dataIndex: 'name'
		    },{
		    	header: " Должность", 
		    	//width: 8,
				//anchor:'100%',
		    	sortable: true, 
		    	dataIndex: 'title'
		    },{
		    //	header: " Должность", 
		    	//width: 8,
				//anchor:'100%',
		    	hidden:true,
		    	sortable: true, 
		    	dataIndex: 'department'
		    }
		];		
		
		this.store.on('load',function(){
			this.getSelectionModel().selectFirstRow(0);
		},this);
		
		this.departmentStore = new Ext.data.RESTStore({
			autoLoad : true,
			apiUrl : get_api_url('department'),
			model: [
				    {name: 'resource_uri'},
				    {name: 'name'},
				    {name: 'id'}
				]
		});
		
		this.departmentCB = new Ext.form.LazyClearableComboBox({
        	fieldLabel:'Отдел',
			width:150,
			forceSelection:true,
        	store:this.departmentStore,
		    displayField: 'name',
		    queryParam:'name__istartswith',
		    listeners:{
		    	'select':function(combo,record,index){
		    		if (record) {
		    			this.store.filter('department',record.data.resource_uri);
		    		} else {
		    			this.store.clearFilter()
		    		}
		    	},
		    	'clearclick': function() {
		    		this.store.clearFilter();
		    	},
		    	scope:this
		    }
		});

		var config = {
			//title:'Врачи',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			stripeRows:true,
			border : false,
			store:this.store,
			//height:500,
			columns:this.columns,
			tbar: [this.departmentCB]
			//sm : new Ext.grid.RowSelectionModel({
				//singleSelect : true
			//})
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.calendar.StaffGrid.superclass.initComponent.apply(this, arguments);
		
	},
	
	afterRender: function() {
		this.getSelectionModel().selectFirstRow(0);
    }
	
});


Ext.reg('staffgrid', Ext.calendar.StaffGrid);
