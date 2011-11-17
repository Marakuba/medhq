Ext.ns('App.cards');

App.cards.UgSmear = Ext.extend(App.cards.BaseCard,{
	initComponent: function(){
		
		this.mode = 'column';
		
		this.mappings['Уретра'] = 'valU';
		this.mappings['Шейка матки'] = 'valC';
		this.mappings['Влагалище'] = 'valV';
		
		this.editor = new App.fields.InputList();
		
		this.gs = new Ext.data.ArrayStore({
			fields:['name','code','inputlistvalU','inputlistvalC','inputlistvalV','valU','valC','valV']
		});
		
		this.commentField = new Ext.form.TextArea({
			anchor:'100% 100%',
		});
		
		this.grid = new Ext.grid.EditorGridPanel({
			clicksToEdit:1,
			flex:1,
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
					hidden:this.record.data.is_male,
					editor:this.editor
				},{
					header:'Влагалище',
					dataIndex:'valV',
					width:15,
					hidden:this.record.data.is_male,
					editor:this.editor
				}],
				store:this.gs,
			    getCellEditor : function(colIndex, rowIndex) {
			    	var ed = this.config[colIndex].getCellEditor(rowIndex);
			    	if( colIndex>=1 && colIndex<=3 ) {
			    		var rec = this.store.getAt(rowIndex);
			    		var inputlist = rec.get(String.format('inputlist{0}',this.config[colIndex].dataIndex));
			    		ed.field.getStore().loadData(inputlist);
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
			layout:{
				type:'vbox',
				align:'stretch'
			},
			items:[this.grid,{
				layout:'form',
				height:100,
				hideLabels:true,
				border:false,
				padding:5,
				title:'Комментарий',
				items:[this.commentField]
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.cards.UgSmear.superclass.initComponent.apply(this, arguments);
		this.on('laborderload', this.onLabOrderLoad, this);
	},
	
	onLabOrderLoad : function(){
		if(this.labOrderRecord){
			this.commentField.setValue(this.labOrderRecord.get('comment'));
		}
	},
	
	onSave : function(){
		if(this.labOrderRecord) {
			this.labOrderRecord.set('comment', this.commentField.getValue());
		}
		App.cards.UgSmear.superclass.onSave.call(this, arguments);
	},
	
	processRow : function(rec, vals){
		var idx = String.format('inputlist{0}',this.mappings[vals[1]]);
		var obj = {};
		obj[idx] = rec.get('inputlist');
		return obj
	}
	
});


Ext.reg('ugsmearmanualtest',App.cards.UgSmear);