Ext.ns('App.reporting');

App.reporting.SummaryGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('summaries')
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'report', allowBlank: false},
		    {name: 'summary_item', allowBlank: true},
		    {name: 'colspan', allowBlank: true},
		    {name: 'summary_item_name', allowBlank: true}
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
		    	report: this.record.id
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
		    writer: this.writer
		});

		this.cmb = new Ext.form.ComboBox({
			    store: new Ext.data.JsonStore({
					autoLoad:true,
					proxy: new Ext.data.HttpProxy({
						url:get_api_url('summaryitem'),
						method:'GET'
					}),
					root:'objects',
					idProperty:'resource_uri',
					fields:['resource_uri','name']
				}),
			    typeAhead: true,
			    queryParam:'name__istartswith',
			    minChars:3,
			    triggerAction: 'all',
			    emptyText:'Выберите итог...',
			    valueField: 'resource_uri',
			    displayField: 'name',
			    selectOnFocus:true
		});
		
		this.columns =  [new Ext.grid.RowNumberer({width: 20}),{
				hidden:true,
				dataIndex:'report'
			},{
				hidden:true,
				dataIndex:'summary_item'
			},{
		    	header: "Наименование", 
		    	width: 40, 
		    	sortable: true, 
		    	dataIndex: 'summary_item_name',
		    	editor: this.cmb
		    },{
		    	header: "Колонки", 
		    	width: 10, 
		    	sortable: true, 
		    	dataIndex: 'colspan',
		    	editor: new Ext.form.TextField({})
		    }
		];		
		
		this.editor = new Ext.ux.grid.RowEditor({
       		saveText: 'Сохранить',
       		cancelText: 'Отменить',
       		listeners:{
       			afteredit:function(editor,changes,rec,i){
       				rec.data.summary_item = rec.data.summary_item_name;
       				this.store.save();
       			},
       			scope:this
       		}
    	});

    	var config = {
			title:'Итоги',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : true,
			store:this.store,
			columns:this.columns,
			plugins: [this.editor],
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
				iconCls:'silk-delete',
				text:'Удалить',
				handler:this.onDelete.createDelegate(this, [])
			},'->',{
				iconCls: 'x-tbar-loading',
				handler:function(){
					this.store.reload();
				},
				scope:this
			}],
			listeners: {
				//rowdblclick:this.onPrint.createDelegate(this, [])
			},
			viewConfig : {
				forceFit : true,
				emptyText: 'Нет записей'
				//getRowClass : this.applyRowClass
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.reporting.SummaryGrid.superclass.initComponent.apply(this, arguments);
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	onAdd: function(){
        var r = new this.store.recordType({
        	report:this.record.data.resource_uri,
        	colspan:1
        });
        this.editor.stopEditing();
        this.store.add(r);
        this.editor.startEditing(this.store.getCount()-1);
	},
	
	onDelete: function(){
		var rec = this.getSelected();
		this.store.remove(rec);
		this.store.save();
	}
	
});



Ext.reg('reportsummarygrid',App.reporting.SummaryGrid);