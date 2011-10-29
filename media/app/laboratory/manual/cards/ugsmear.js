Ext.ns('App.cards');

App.cards.UgSmear = Ext.extend(App.cards.BaseCard,{
	initComponent: function(){
		
		this.editor = new App.fields.InputList({
			
		});
		
		this.gs = new Ext.data.ArrayStore({
			fields:['name','code','inputlist','valU','valC','valV']
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
					header:'Уретра',
					dataIndex:'valU',
					width:15,
					editor:this.editor
				},{
					header:'Шейка матки',
					dataIndex:'valC',
					width:15,
					editor:this.editor
				},{
					header:'Влагалище',
					dataIndex:'valV',
					width:15,
					editor:this.editor
				}],
				store:this.gs,
			    getCellEditor : function(colIndex, rowIndex) {
			    	var ed = this.config[colIndex].getCellEditor(rowIndex);
			    	if( colIndex>=1 && colIndex<=3 ) {
			    		var rec = this.store.getAt(rowIndex);
			    		var inputlist = rec.data.inputlist;
			    		ed.field.getStore().loadData(inputlist);
//			    		console.info(ed);
			    	}
			    	return ed;
			    }
			}),
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : false
			}),
			viewConfig : {
				forceFit : true
			}
		});
		
		config = {
			title:'Урогенитальный мазок',
			layout:'fit',
			items:[this.grid]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.cards.UgSmear.superclass.initComponent.apply(this, arguments);
		
		if(this.record && this.service) {
			this.store.setBaseParam('order',this.record.id);
			this.store.setBaseParam('analysis__service',this.service);
			this.store.load({
				callback:function(r, opts, success){
					var gs = this.grid.getStore();
					var Test = gs.recordType;
					gs.removeAll();
					Ext.each(r, function(rec){
						var new_rec = new Test({
							name:rec.get('analysis_name'),
							code:rec.get('analysis_code'),
							inputlist:rec.get('inputlist'),
						});
						gs.add(new_rec);
					}, this);
				},
				scope:this
			})
		}
	},
	
});


Ext.reg('ugsmearmanualtest',App.cards.UgSmear);