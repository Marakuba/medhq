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
			{name: 'repeats'},
			{name: 'completed', type:'date', format:'c'},
			{name: 'created', type:'date', format:'c'}
		]);
		
		this.store = new Ext.data.RESTStore({
			autoLoad : true,
			autoSave : false,
			apiUrl : App.getApiUrl('equipmenttaskro'),
			model: this.model
		});
		
		this.store.on('save',this.onStoreSave, this);
		
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
		    	dataIndex: 'equipment_name'
		    },{
		    	header: "Исследование", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'service_name'
		    },{
		    	header: "Результат", 
		    	width: 20, 
		    	dataIndex: 'result'
		    },/*{
		    	header: "Кол-во", 
		    	width: 8, 
		    	dataIndex: 'repeats'
		    },*/{
		    	header: "Статус", 
		    	width: 8, 
		    	dataIndex: 'status_name'
		    }
		];		
		
		this.restoreBtn = new Ext.Button({
			text:'Сбросить статус',
			hidden:true,
			handler: function(){
				var records = this.getSelectionModel().getSelections();
				Ext.each(records, function(rec,i){
					rec.set('status','wait');
				});
				this.store.save();
			},
			scope:this
		});
		
		this.statusBtn = new Ext.CycleButton({
            showText: true,
            prependText: 'Статус: ',
            items: [{
                text:'все',
                checked:true,
                filterValue:undefined
            },{
                text:'ожидание',
                filterValue:'wait'
            },{
                text:'в работе',
                filterValue:'proc'
            },{
                text:'выполнено',
                filterValue:'done'
            },{
                text:'повторы',
                filterValue:'rept'
            }],
            changeHandler:function(btn, item){
            	this.storeFilter('status',item.filterValue);
            	this.restoreBtn.setVisible(item.filterValue=='proc' || item.filterValue=='done');
            },
            scope:this
        });
		
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
				singleSelect : false
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
						this.storeFilter('equipment_assay__equipment',rec.id);
					},
					clearclick:function(){
						this.storeFilter('equipment_assay__equipment');
					},
					scope:this
				}
			}),
			this.statusBtn, this.restoreBtn, '->',{
				iconCls:'x-tbar-loading',
				handler:function(){
					this.store.load();
				},
				scope:this
			}],
			
			bbar: new Ext.PagingToolbar({
	            pageSize: 50,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: '{0} - {1} | {2}',
	            emptyMsg: "Нет записей",
//	            items:['-',this.filterText]
	        }),

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
		
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		
	},
	
	onStoreSave : function(){
		this.statusBtn.setActiveItem(1);
	},
	
	onGlobalSearch: function(v){
		this.storeFilter('search', v)
	},
	
	storeFilter: function(field, value){
		if(!value) {
			delete this.store.baseParams[field]
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