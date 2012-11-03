Ext.ns('App.equipment');

App.equipment.EquipmentAssayGrid = Ext.extend(Ext.grid.EditorGridPanel, {

	initComponent : function() {

		this.model = new Ext.data.Record.create([
            {name: 'id'},
            {name: 'resource_uri'},
            {name: 'equipment'},
            {name: 'equipment_name'},
            {name: 'service'},
            {name: 'service_name'},
            {name: 'name'},
            {name: 'code'},
            {name: 'def_protocol'},
            {name: 'is_active'}
        ]);

		this.store = new Ext.data.RESTStore({
			autoLoad:false,
			model:this.model,
			apiUrl:App.getApiUrl('equipmentassay')
		});

		this.comboRenderer = function(combo, field){
		    return function(value, meta, rec){
		        var record = combo.findRecord(combo.valueField, value);
		        return record ? record.get(combo.displayField) : (rec ? rec.get(field) : combo.valueNotFoundText);
		    }
		};

		this.columns =  [
		    {
		    	header: "Оборудование",
		    	width: 12,
		    	dataIndex: 'equipment_name',
//		    	editor:this.eqCmb,
//		    	renderer: this.comboRenderer(this.eqCmb, 'equipment_name')
		    },{
		    	header: "Исследование",
		    	width: 60,
		    	sortable: false,
		    	dataIndex: 'service_name',
//		    	editor:this.serviceCmb,
//		    	renderer: this.comboRenderer(this.serviceCmb, 'service_name')
		    },{
		    	header: "Название",
		    	width: 20,
		    	sortable: false,
		    	dataIndex: 'name',
		    	editor : new Ext.form.TextField()
		    },{
		    	header: "Код",
		    	width: 10,
		    	sortable: false,
		    	dataIndex: 'code',
		    	editor : new Ext.form.TextField()
		    },{
		    	header: "Протокол",
		    	width: 15,
		    	sortable: false,
		    	dataIndex: 'def_protocol',
		    	editor : new Ext.form.TextField()
		    },{
		    	header: "Активно",
		    	width: 8,
		    	sortable: true,
		    	dataIndex: 'is_active',
		    	editor:new Ext.form.Checkbox({}),
		    	renderer: function(val) {
		    		flag = val ? 'yes' : 'no';
		    		return "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>"
		    	}
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
			tbar:['Анализатор:',new Ext.form.ClearableComboBox({
				emptyText:'Любой',
			    queryParam:'name__istartswith',
			    minChars:2,
			    triggerAction: 'all',
			    valueField: 'resource_uri',
			    store: new Ext.data.JsonStore({
					autoLoad:true,
					proxy: new Ext.data.HttpProxy({
						url:App.getApiUrl('equipment'),
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
			'Активность:', {
				text:'Все',
				pressed:true,
				toggleGroup:'activity'
			}, {
				text:'Активные',
				toggleGroup:'activity'
			}, {
				text:'Неактивные',
				toggleGroup:'activity'
			}, '->',{
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
			viewConfig : {
				forceFit : true
			}
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.equipment.EquipmentAssayGrid.superclass.initComponent.apply(this, arguments);

		this.on('afterrender', function(){
			this.store.load();
		}, this);

	},

	onAdd: function() {
		var s = this.getStore();
		var Record = s.recordType;
		s.insert(0, new Record({}));
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



Ext.reg('equipmentassaygrid', App.equipment.EquipmentAssayGrid);
