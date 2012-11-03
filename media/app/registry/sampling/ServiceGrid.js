Ext.ns('App.sampling');

App.sampling.ServiceGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {

		this.proxy = new Ext.data.HttpProxy({
		    url: App.getApiUrl('samplingservice')
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
			autoLoad:false,
			autoSave:false,
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
		    reader: this.reader,
		    writer: this.writer,
		    listeners: {
		    	write: function(store,action,result,res,rs){
		    		store.reload();
		    		console.log(action);
		    		if(action=='destroy') {
		    			this.fireEvent('freerecord');
		    		}
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
			title:'Исследования',
			ddGroup:'GridDDGroup',
			enableDragDrop: true,
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true
			}),
	        tbar:[{
				xtype:'button',
				iconCls:'silk-arrow-down',
				text:'Удалить из пробирки',
				handler:this.onFree.createDelegate(this)
			}],
			viewConfig : {
				forceFit : true,
				emptyText: 'Нет записей'
			}

		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.sampling.ServiceGrid.superclass.initComponent.apply(this, arguments);
	},

	onMove: function(){
		var rec = this.getSelectionModel().getSelected();
		if (rec) {
			this.fireEvent('moverecord', rec);
		}
	},

	onFree: function(){
		var rec = this.getSelectionModel().getSelected();
		if (rec) {
			this.store.remove(rec);
			this.store.save();
		}
	}

});
