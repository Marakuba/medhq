Ext.ns('App.sampling');

App.sampling.FreeGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('samplingservice')
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'order'},
		    {name: 'service'},
		    {name: 'sampling'},
		    {name: 'service_full_name'}
		]);
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false,
		    writeAllFields: true
		});
		
		this.store = new Ext.data.Store({
			autoLoad:true,
			autoSave:false,
		    baseParams: {
		    	format:'json',
		    	sampling__isnull:true,
		    	order:this.visitId
		    },
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
		    restful: true,
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer,
		    listeners: {
		    	write: function(store,action,result,res,rs){
		    		var s = rs.data.sampling.split('/');
		    		s = s[s.length-1];
		    		this.fireEvent('nodemoved',s);
		    		store.reload();
		    	},
		    	scope:this
		    }
		});
		
		this.columns =  [new Ext.grid.RowNumberer({width: 20}),
		    {
		    	header: "Название", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'service_full_name' 
		    }
		];
		
		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			ddGroup:'GridDDGroup',
			enableDragDrop: true,
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true
			}),
	        /*tbar:[{
				xtype:'button',
				iconCls:'silk-arrow-left',
				text:'Переместить',
				handler:this.onMove.createDelegate(this)
			}],*/
			viewConfig : {
				forceFit : true,
				emptyText: 'Нет записей'
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.sampling.FreeGrid.superclass.initComponent.apply(this, arguments);
	},
	
	onMove: function(){
		var rec = this.getSelectionModel().getSelected();
		if (rec) {
			this.fireEvent('moverecord', rec);
		}
	}
	
});