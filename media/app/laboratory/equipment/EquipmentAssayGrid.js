Ext.ns('App.equipment');

App.equipment.EquipmentAssayGrid = Ext.extend(Ext.grid.EditorGridPanel, {

	initComponent : function() {
		
		this.backend = App.getBackend('equipmentassay');		
		
		this.store = this.backend.store;
		
		this.comboRenderer = function(combo, field){
		    return function(value, meta, rec){
		        var record = combo.findRecord(combo.valueField, value);
		        return record ? record.get(combo.displayField) : (rec ? rec.get(field) : combo.valueNotFoundText);
		    }
		};
		
		this.eqCmb = new Ext.form.LazyComboBox({
			proxyUrl:get_api_url('equipment'),
		});
		
		this.serviceCmb = new Ext.form.LazyComboBox({
			proxyUrl:get_api_url('baseservice'),
		});
		
		this.columns =  [
		    {
		    	header: "Оборудование", 
		    	width: 50,
		    	dataIndex: 'equipment_name',
		    	editor:this.eqCmb,
		    	renderer: this.comboRenderer(this.eqCmb, 'equipment_name')
		    },{
		    	header: "Исследование", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'service_name',
		    	editor:this.serviceCmb,
		    	renderer: this.comboRenderer(this.serviceCmb, 'service_name')
		    }
		];		
		
		var config = {
			id:'equipment-grid',
			title:'Аппаратные исследования',
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
		App.equipment.EquipmentAssayGrid.superclass.initComponent.apply(this, arguments);
		
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



Ext.reg('equipmentassaygrid', App.equipment.EquipmentAssayGrid);