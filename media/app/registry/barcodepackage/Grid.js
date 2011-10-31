Ext.ns('App.barcodepackage');



App.barcodepackage.Grid = Ext.extend(Ext.grid.GridPanel, {

	loadInstant: false,
	
	initComponent : function() {
		
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('barcodepackage')
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'  
		}, [
		    {name: 'id'},
		    {name: 'created', allowBlank: true, type:'date'},
		    {name: 'print_date', allowBlank: true, type:'date'},
		    {name: 'laboratory', allowBlank: false},
		    {name: 'lab_name', allowBlank: true},
		    {name: 'range_from', allowBlank: true},
		    {name: 'range_to', allowBlank: true},
		    {name: 'x2', allowBlank: true},
		    {name: 'x3', allowBlank: true},
		    {name: 'x4', allowBlank: true},
		    {name: 'x5', allowBlank: true},
		    {name: 'x6', allowBlank: true},
		    {name: 'x7', allowBlank: true},
		    {name: 'x8', allowBlank: true}
		]);
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false
		});
		this.baseParams = {
		    format:'json'
		}; 
		this.store = new Ext.data.Store({
			//autoLoad:true,
		    baseParams: this.baseParams,
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
		    listeners:{
		    	load:function(){
		    		
		    	}
		    	,scope:this
		    }
		});
		this.store.load();
		this.columns =  [
		    {
		    	header: "Дата", 
		    	width: 15, 
		    	sortable: true, 
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y H:i')
		    },{
		    	header: "Распечатано", 
		    	width: 15, 
		    	sortable: true, 
		    	dataIndex: 'print_date',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y H:i')
		    },{
		    	header: "Лаборатория", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'lab_name'
		    },{
		    	header:'x2',
		    	width:10,
		    	dataIndex:'x2'
		    },{
		    	header:'x3',
		    	width:10,
		    	dataIndex:'x3'
		    },{
		    	header:'x4',
		    	width:10,
		    	dataIndex:'x4'
		    },{
		    	header:'x5',
		    	width:10,
		    	dataIndex:'x5'
		    },{
		    	header:'x6',
		    	width:10,
		    	dataIndex:'x6'
		    },{
		    	header:'x7',
		    	width:10,
		    	dataIndex:'x7'
		    },{
		    	header:'x8',
		    	width:10,
		    	dataIndex:'x8'
		    },{
		    	header: "Начальный номер", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'range_from' 
		    },{
		    	header: "Конечный номер", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'range_to' 
		    }
		];		
		
		var config = {
			title:'Серии штрих-кодов',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true
			}),
			listeners: {
			},
			tbar:[{
				iconCls:'silk-add',
				text:'Добавить',
				handler:this.onAdd.createDelegate(this,[])
			},{
				iconCls:'silk-pencil',
				text:'Изменить',
				handler:this.onChange.createDelegate(this,[])
			},{
				iconCls:'silk-printer',
				text:'Печать',
				handler:this.onPrint.createDelegate(this,[])
			},'-',{
				text:'Дубликат',
				handler:this.onPrintDuplicate.createDelegate(this,[])
			}],
	        bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			viewConfig : {
				forceFit : true
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.barcodepackage.Grid.superclass.initComponent.apply(this, arguments);
		
		this.on('render', function(){
			//this.store.load();
			this.getSelectionModel().selectFirstRow();
		}, this);
	},
	
	onAdd: function(){
		var win;
		win = new App.barcodepackage.Window({
			store:this.store
		});
		win.show();
	},
	
	onChange: function(){
		var win;
		var record = this.getSelectionModel().getSelected();
		if (record) {
			win = new App.barcodepackage.Window({
				record:record,
				store:this.store
			});
			win.show();
		}
	},
	
	onPrint: function(){
		var record = this.getSelectionModel().getSelected();
		if (record) {
			var d = record.data;
			var tpl = new Ext.Template(
				'<p>Серия штрих-кодов: {range_from} - {range_to}</p>',
				'<p>Лаборатория: {lab_name}</p>',
				'<p>Кратность / количество</p>',
				'<p>x2: {x2}</p>',
				'<p>x3: {x3}</p>',
				'<p>x4: {x4}</p>',
				'<p>x5: {x5}</p>',
				'<p>x6: {x6}</p>',
				'<p>x7: {x7}</p>',
				'<p>x8: {x8}</p>'
			);
			Ext.Msg.show({
				title:'Подтверждение печати', 
				msg:tpl.apply(d),
				buttons: Ext.Msg.OKCANCEL,
				fn:function(btn, text){
			    	if (btn == 'ok'){
						var url = '/numeration/package/'+record.id+'/';
						window.open(url);
			    	}
				}
			});
		}
	},
	
	onPrintDuplicate: function(){
		var win;
		win = new App.barcodepackage.DuplicateWindow({
		});
		win.show();
	}
	

	
});

Ext.reg('barcodepackagegrid',App.barcodepackage.Grid);