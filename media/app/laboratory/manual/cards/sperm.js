Ext.ns('App.cards');

App.cards.Spermogram = Ext.extend(App.cards.BaseCard,{
	initComponent: function(){
		
		this.mode = 'group';
		
//		this.mappings['Уретра'] = 'valU';
//		this.mappings['Шейка матки'] = 'valC';
//		this.mappings['Влагалище'] = 'valV';
		
		this.editor = new App.fields.InputList();
		
//		this.gs = new Ext.data.GroupingStore({
//			fields:['name','code','group','value'],
//			groupField:'group'
//		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, ['name','code','inputlist','group','value']);
		this.gs = new Ext.data.GroupingStore({
			autoSave:false,
			autoLoad:false,
		    reader: this.reader,
		    remoteSort: true,
		    groupField:'group'
		});
		
		this.grid = new Ext.grid.EditorGridPanel({
			clicksToEdit:1,
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			store:this.gs,
			stripeRows:true,
			border : false,
			cm:new Ext.grid.ColumnModel({
				columns:[{
					header:'Тест',
					dataIndex:'name',
					width:55
				},{
					header:'Group',
					dataIndex:'group',
					hidden:true,
					width:55
				},{
					header:'Результат',
					dataIndex:'value',
					width:15,
					editor:this.editor
				}],
				store:this.gs,
			    getCellEditor : function(colIndex, rowIndex) {
			    	var ed = this.config[colIndex].getCellEditor(rowIndex);
			    	if( this.config[colIndex].dataIndex=='value' ) {
			    		var rec = this.store.getAt(rowIndex);
			    		var inputlist = rec.get('inputlist');
			    		ed.field.getStore().loadData(inputlist);
			    	}
			    	return ed;
			    }
			}),
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : false
			}),
			view : new Ext.grid.GroupingView({
				forceFit : true,
				groupTextTpl : '{gvalue}'
			})
		});
		
		config = {
			title:'Спермограмма',
			layout:'fit',
			items:[this.grid]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.cards.Spermogram.superclass.initComponent.apply(this, arguments);
		
	},
	
	processRow : function(rec, vals){
		var obj = {
			inputlist : rec.get('inputlist')
		};
		return obj
	}
	
});


Ext.reg('spermmanualtest',App.cards.Spermogram);