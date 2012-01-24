Ext.ns('App.examination');

App.examination.ConclGrid = Ext.extend(Ext.grid.EditorGridPanel, {
	
	initComponent: function(){

//        this.Mess = new Ext.App({});

        this.proxy = new Ext.data.HttpProxy({
            url: get_api_url('card')
        });
		this.baseParams = {
            format:'json'
        };
    
        this.reader = new Ext.data.JsonReader({
            totalProperty: 'meta.total_count',
            successProperty: 'success',
            idProperty: 'id',
            root: 'objects',
            messageProperty: 'message'
        }, App.models.Card);
    
        this.writer = new Ext.data.JsonWriter({
            encode: false,
            writeAllFields: true
        }); 
    
        this.store = new Ext.data.Store({
//            id: 'name',
            restful: true,    
            autoLoad: false, 
			autoDestroy:true,
            baseParams: this.baseParams,
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
            proxy: this.proxy,
            reader: this.reader,
            writer: this.writer
        });

		this.store.on('load', function(){
			this.getSelectionModel().selectFirstRow();
		}, this);
		
		this.assistant = new Ext.form.LazyClearableComboBox({
			fieldLabel:'Лаборант',
			name:'assistant',
			anchor:'50%',
			valueField:'resource_uri',
			queryParam : 'staff__last_name__istartswith',
			store:new Ext.data.RESTStore({
				autoLoad : true,
				apiUrl : get_api_url('position'),
				model: ['id','name','resource_uri']
			}),
		    minChars:2,
		    emptyText:'Выберите врача...',
		    listeners:{
		    	select: function(combo, rec,i) {
		    	},
		    	scope:this
		    }
		});
		
		Ext.util.Format.comboRenderer = function(combo,field){
            return function(value, meta, rec){
                var record = combo.findRecord(combo.valueField, value);
                return record ? record.get(combo.displayField) : (rec ? rec.get(field) : combo.valueNotFoundText);
            }
        };

        this.columns =  [
            {
                header: "Дата создания",
                width: 40, 
                sortable: true, 
                dataIndex: 'created',
                renderer:Ext.util.Format.dateRenderer('d.m.Y H:i')
            },{
                header: "Услуга", 
                width: 100, 
                sortable: true, 
                dataIndex: 'print_name'
            },{
                header: "Пациент", 
                width: 100, 
                sortable: true, 
                dataIndex: 'patient_name'
            },{
                header: "Лаборант", 
                width: 100, 
                sortable: true, 
                dataIndex: 'assistant', 
                editor: this.assistant,
                renderer: Ext.util.Format.comboRenderer(this.assistant,'assistant_name')
            },{
                header: "Лаборант", 
                width: 100, 
                sortable: true, 
                hidden:true,
                dataIndex: 'assistant_name' 
            },{
                header: "Дата изменения", 
                width: 60, 
                sortable: true, 
                dataIndex: 'modified',
                renderer:Ext.util.Format.dateRenderer('d.m.Y H:i')
            }
        ];
    
    

        config = {
//            id: 'concl-grid',
            title: 'Журнал заказов',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
            height: 300,
            clicksToEdit: 1,
            border:false,
            store: this.store,
            columns : this.columns,
            closable: 'true',
			sm : new Ext.grid.RowSelectionModel({
						singleSelect : true
					}),
            tbar: [{
                text: 'Добавить',
                iconCls: 'silk-add',
                scope: this,
                handler: this.onAdd
            }, '-', {
                text: 'Удалить',
                iconCls: 'silk-delete',
                scope: this,
                handler: this.onDelete
            }, '-'],
	        bbar: new Ext.PagingToolbar({
	            pageSize: 30,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
            viewConfig: {
                forceFit: true
            }
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
	    App.examination.ConclGrid.superclass.initComponent.apply(this, arguments);

		this.on('afterrender', function(){
			if (this.staff){
				this.store.setBaseParam('staff',this.staff);
				this.store.load();
			}
		}, this);
		
		this.on('rowclick',function(grid,rowIndex,e){});
		this.on('rowdblclick',function(grid,rowIndex,e){});
    },    
    /**
     * onAdd
     */
    onAdd: function (btn, ev) {
        var data = {
            'name' : ''
        }
        var u = new this.store.recordType(data);
        this.stopEditing();
        this.store.insert(0, u);
        this.startEditing(0,1);
    },
    /**
     * onDelete
     */
    onDelete: function () {
        var rec = this.getSelectionModel().getSelected();
        if (!rec) {
            return false;
        }
        this.store.remove(rec);
    }

});

Ext.reg('conclgrid', App.examination.ConclGrid);
