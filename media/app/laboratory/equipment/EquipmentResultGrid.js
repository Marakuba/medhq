Ext.ns('App.equipment');

App.equipment.EquipmentResultGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.backend = App.getBackend('equipmentresult');		
		
		this.store = this.backend.store;
		
		this.columns =  [{
		    	header: "Заказ", 
		    	width: 10,
		    	dataIndex: 'order'
		    }, {
		    	header: "Исследование", 
		    	width: 10,
		    	dataIndex: 'assay'
		    }, {
		    	header: "Результат", 
		    	width: 20,
		    	dataIndex: 'result'
		    }, {
		    	header: "Ед.изм.", 
		    	width: 20,
		    	dataIndex: 'measurement'
		}];		
		
		var config = {
			id:'equipment-result-grid',
			title:'Результаты исследований',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			closable:true,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true
			}),
			tbar:[/*{
				iconCls:'silk-add',
				text:'Добавить',
				handler:this.onAdd.createDelegate(this)
			},*/'->',{
				iconCls:'x-tbar-loading',
				handler:function(){
					this.store.load();
				},
				scope:this
			}],
			listeners: {
			},
			viewConfig : {
				forceFit : true
			}			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.equipment.EquipmentResultGrid.superclass.initComponent.apply(this, arguments);
		
	},
	
	onAdd: function() {
		var s = this.getStore();
		var Record = s.recordType;
		s.insert(0, new Record({}));
	},
	
	storeFilter: function(field, value){
		if(!value) {
			//console.log(this.store.baseParams[field]);
			delete this.store.baseParams[field]
			//this.store.setBaseParam(field, );
		} else {
			this.store.setBaseParam(field, value);
		}
		this.store.load();
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	
});



Ext.reg('equipmentresultgrid', App.equipment.EquipmentResultGrid);