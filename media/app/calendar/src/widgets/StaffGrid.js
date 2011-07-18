
Ext.ns('Ext.calendar');
Ext.calendar.StaffGrid = Ext.extend(Ext.grid.GridPanel, {
    initComponent : function() {
		
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('staff')
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'name'}
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
				anchor:'100%',
		    	sortable: true, 
		    	dataIndex: 'name'
		    }
		];		
		
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
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true
			})
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.calendar.StaffGrid.superclass.initComponent.apply(this, arguments);
		
	}
	
});


Ext.reg('staffgrid', Ext.calendar.StaffGrid);
