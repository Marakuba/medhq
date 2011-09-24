Ext.ns('App.equipment');

App.equipment.EquipmentTaskGrid = Ext.extend(Ext.grid.EditorGridPanel, {

	initComponent : function() {
		
		this.backend = App.getBackend('equipmenttask');		
		
		this.store = this.backend.store;
		
		this.columns =  [
		    {
		    	header: "Добавлено", 
		    	width: 10,
		    	dataIndex: 'created',
		    	renderer: Ext.util.Format.dateRenderer('d.m.Y')
		    },{
		    	header: "Заказ", 
		    	width: 10,
		    	dataIndex: 'order'
		    },{
		    	header: "Анализатор", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'equipment_name'
		    },{
		    	header: "Исследование", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'service_name'
		    },{
		    	header: "Выполнено", 
		    	width: 10, 
		    	sortable: true, 
		    	dataIndex: 'completed',
		    	renderer: function(val) {
		    		flag = val ? 'yes' : 'no';
		    		return "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>" 
		    			+ (val ? Ext.util.Format.date(val,'d.m.Y') : '');
		    	}
		    },{
		    	header: "Статус", 
		    	width: 8, 
		    	sortable: true, 
		    	dataIndex: 'status_name'
		    }
		];		
		
		var config = {
			id:'equipment-task-grid',
			title:'Задания',
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
			view : new Ext.grid.GridView({
				forceFit : true,
				emptyText: 'Нет записей',
				getRowClass: function(record, index) {
		            var s = record.get('status');
		            return String.format('x-equipment-task-{0}',s);
		        }
			})
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.equipment.EquipmentTaskGrid.superclass.initComponent.apply(this, arguments);
		
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



Ext.reg('equipmenttaskgrid', App.equipment.EquipmentTaskGrid);