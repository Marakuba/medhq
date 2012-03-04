Ext.ns('App.equipment');

App.equipment.EquipmentTaskGrid = Ext.extend(Ext.grid.EditorGridPanel, {

	initComponent : function() {
		
		this.model = new Ext.data.Record.create([
			{name: 'id'},
			{name: 'resource_uri'},
			{name: 'equipment_assay'},
			{name: 'ordered_service'},
			{name: 'equipment_name'},
			{name: 'service_name'},
			{name: 'patient_name'},
			{name: 'order'},
			{name: 'result'},
			{name: 'status'},
			{name: 'status_name'},
			{name: 'completed', type:'date', format:'c'},
			{name: 'created', type:'date', format:'c'}
		]);
		
		this.store = new Ext.data.RESTStore({
			apiUrl : App.getApiUrl('equipmenttask'),
			model: this.model
		});
		
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
		    	header: "Пациент", 
		    	width: 30, 
		    	sortable: true, 
		    	dataIndex: 'patient_name'
		    },{
		    	header: "Оборудование", 
		    	width: 20, 
		    	sortable: true, 
		    	dataIndex: 'equipment_name'
		    },{
		    	header: "Исследование", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'service_name'
		    },{
		    	header: "Результат", 
		    	width: 20, 
		    	sortable: false, 
		    	dataIndex: 'result'
		    },/*{
		    	header: "Выполнено", 
		    	width: 10, 
		    	sortable: true, 
		    	dataIndex: 'completed',
		    	renderer: function(val) {
		    		flag = val ? 'yes' : 'no';
		    		return "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>" 
		    			+ (val ? Ext.util.Format.date(val,'d.m.Y') : '');
		    	}
		    },*/{
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
			tbar:['Анализатор:',new Ext.form.ClearableComboBox({
				emptyText:'Любой',
			    queryParam:'name__istartswith',
			    minChars:2,
			    triggerAction: 'all',
			    valueField: 'resource_uri',
			    store: new Ext.data.JsonStore({
					autoLoad:true,
					proxy: new Ext.data.HttpProxy({
						url:get_api_url('equipment'),
						method:'GET'
					}),
					root:'objects',
					idProperty:'id',
					fields:['id','resource_uri','name']
				}),
				valueField:'id',
				displayField:'name',
				listeners:{
					select:function(cmb,rec) {
						this.storeFilter('equipment',rec.id);
					},
					clearclick:function(){
						this.storeFilter('equipment');
					},
					scope:this
				}
			}),
			new Ext.CycleButton({
	            showText: true,
	            prependText: 'Статус: ',
	            items: [{
	                text:'все',
	                checked:true,
	                filterValue:undefined
	            },{
	                text:'ожидание',
//	                iconCls:'icon-state-yes',
	                filterValue:'wait'
	            },{
	                text:'в работе',
//	                iconCls:'icon-state-no',
	                filterValue:'proc'
	            },{
	                text:'выполнено',
//	                iconCls:'icon-state-no',
	                filterValue:'done'
	            },{
	                text:'повторы',
//	                iconCls:'icon-state-no',
	                filterValue:'rept'
	            }],
	            changeHandler:function(btn, item){
	            	this.storeFilter('status',item.filterValue);
	            },
	            scope:this
	        }), '->',{
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