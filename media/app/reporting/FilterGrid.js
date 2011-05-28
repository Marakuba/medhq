Ext.ns('App.reporting');

App.reporting.FilterGrid = Ext.extend(Ext.grid.EditorGridPanel, {

	initComponent : function() {
		
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('filters')
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
		    {name: 'filter_item', allowBlank: true},
		    {name: 'def_value', allowBlank: true},
		    {name: 'filter_type', allowBlank: true},
		    {name: 'content_type', allowBlank: true},
		    {name: 'filter_item_name', allowBlank: true}
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
						url:get_api_url('filteritem'),
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
			    emptyText:'Выберите поле...',
			    valueField: 'resource_uri',
			    displayField: 'name',
			    selectOnFocus:true
		});
		
		this.colModel = new Ext.grid.ColumnModel({
			columns:  [new Ext.grid.RowNumberer({width: 20}),{
			    	header: "Наименование", 
			    	width: 40, 
			    	sortable: true, 
			    	dataIndex: 'filter_item_name',
			    	editor: this.cmb
			    },{
			    	header: "Значение", 
			    	width: 30, 
			    	sortable: true, 
			    	dataIndex: 'def_value',
			    	editable:true,
			    	renderer: function(v,meta,rec) {
			    		if(rec.data.filter_type=='datefield') {
			    			//return Date.parseDate(v,'d.m.Y');
			    			return Ext.util.Format.date(v,'d.m.Y');
			    		}
			    		return v
			    	}
			    },{
					hidden:true,
					dataIndex:'report'
				},{
					hidden:true,
					dataIndex:'filter_item'
				},{
					hidden:true,
					dataIndex:'filter_type'
				},{
					hidden:true,
					dataIndex:'content_type'
				}
			]
		});
		
		this.cmbEditor = new Ext.grid.GridEditor(this.cmb);
		
		this.editors = {
			'default': new Ext.grid.GridEditor(new Ext.form.TextField({})),
			datefield: new Ext.grid.GridEditor(new Ext.form.DateField({ format:'d.m.Y' })),
			booleanfield: new Ext.grid.GridEditor(new Ext.form.Checkbox({}))
		};
		
		this.cellEditor = function(colIndex, rowIndex) {
	            var s = this.store;
	            if (colIndex==1) {
	            	return this.cmbEditor
	            }
	            if (colIndex==2) {
		            var rec = s.getAt(rowIndex);
		            var type = rec.data.filter_type;
		            var editor;
		            editor = type in this.editors ? this.editors[type] : this.editors['default'];
		            return editor;
	            }
		};
		
		this.colModel.getCellEditor = this.cellEditor.createDelegate(this); 
		
		this.editor = new Ext.ux.grid.RowEditor({
       		saveText: 'Сохранить',
       		cancelText: 'Отменить',
       		listeners:{
       			afteredit:function(editor,changes,rec,i){
       				rec.data.filter_item = rec.data.filter_item_name;
       				//this.store.save();
       			},
       			scope:this
       		}
    	});

    	var config = {
			title:'Фильтры',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : true,
			store:this.store,
			colModel:this.colModel,
			clicksToEdit:1,
			//plugins: [this.editor],
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
				afteredit:function(e) {
					var rec = e.record;
					rec.data.filter_item = rec.data.filter_item_name;
					this.store.save();
				},
				scope:this
			},
			viewConfig : {
				forceFit : true,
				emptyText: 'Нет записей'
				//getRowClass : this.applyRowClass
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.reporting.FilterGrid.superclass.initComponent.apply(this, arguments);
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	onAdd: function(){
        var r = new this.store.recordType({
        	report:this.record.data.resource_uri
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


Ext.reg('reportfiltergrid',App.reporting.FilterGrid);