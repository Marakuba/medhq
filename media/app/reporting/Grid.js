Ext.ns('App.reporting');

App.reporting.Grid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('report')
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'name', allowBlank: false},
		    {name: 'resource_uri', allowBlank: true}
		]);
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false 
		});
		
		this.store = new Ext.data.Store({
			autoLoad:true,
		    baseParams: {
		    	format:'json'
		    },
		    paramNames: {
			    start : 'offset',  // The parameter name which specifies the start row
			    limit : 'limit',  // The parameter name which specifies number of rows to return
			    sort : 'sort',    // The parameter name which specifies the column to sort on
			    dir : 'dir'       // The parameter name which specifies the sort direction
			},
		    restful: true,     // <-- This Store is RESTful
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer    // <-- plug a DataWriter into the store just as you would a Reader
		});
		
		
		this.columns =  [new Ext.grid.RowNumberer({width: 20}),
		    {
		    	header: "Наименование", 
		    	width: 80, 
		    	sortable: true, 
		    	dataIndex: 'name'
		    }
		];		
		
		var config = {
			title:'Отчеты',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true
			}),
	        tbar:[{
				xtype:'button',
				iconCls:'silk-add',
				text:'Добавить',
				handler:this.onAdd.createDelegate(this, [])
			},{
				xtype:'button',
				iconCls:'silk-pencil',
				text:'Изменить',
				handler:this.onChange.createDelegate(this, [])
			},{
				xtype:'button',
				iconCls:'silk-delete',
				text:'Удалить',
				handler:this.onDelete.createDelegate(this, [])
			},'-',{
				xtype:'button',
				//iconCls:'silk-printer',
				text:'Запустить',
				handler:this.onRun.createDelegate(this, [])
			}],
			listeners: {
				rowdblclick:this.onChange.createDelegate(this, [])
			},
			bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			viewConfig : {
				forceFit : true,
				emptyText: 'Нет записей'
				//getRowClass : this.applyRowClass
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.reporting.Grid.superclass.initComponent.apply(this, arguments);
		this.addEvents('reportchange');
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	onRun: function(){
		var rec = this.getSelected();
		var url = '/old/reporting/build_report/'+rec.id+'/';
		window.open(url);
	},
	
	onAdd: function(){
		Ext.MessageBox.prompt('Добавление нового отчета','Введите название отчета', function(btn,v,obj){
			if(btn=='ok') {
				var s = this.store;
				var Report = s.recordType;
				var r = new Report({
					name:v
				});
				s.insert(0,r);
			}
		}, this)
	},
	
	onChange: function(){
		var rec = this.getSelected();
		this.fireEvent('reportchange',rec);
	},
	
	onDelete: function(){
		var rec = this.getSelected();
		Ext.MessageBox.confirm('Подтверждение','Вы действительно хотите удалить отчет '+rec.data.name+'?', function(btn){
			if(btn=='yes') {
				this.store.remove(rec);
			}
		}, this);
		
	}
	
});



Ext.reg('reportgrid',App.reporting.Grid);