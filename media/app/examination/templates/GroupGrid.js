Ext.ns('App.examination');

App.examination.GroupGrid = Ext.extend(Ext.grid.EditorGridPanel, {
	
	initComponent: function(){

//        this.Mess = new Ext.App({});

        this.proxy = new Ext.data.HttpProxy({
            url: get_api_url('templategroup')
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
        }, [
            {name: 'id'},
            {name: 'name', allowBlank: false}
        ]);
    
        this.writer = new Ext.data.JsonWriter({
            encode: false,
            writeAllFields: true
        }); 
    
        this.store = new Ext.data.Store({
//            id: 'name',
            restful: true,    
            autoLoad: true, 
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

        this.Columns =  [
            {
                header: "ID",
                width: 40, 
                sortable: true, 
                dataIndex: 'id'
            },{
                header: "Наименование", 
                width: 100, 
                sortable: true, 
                dataIndex: 'name', 
                editor: new Ext.form.TextField({
                    allowBlank: false
                 })
            }
        ];
    
    

        config = {
            id: 'temp-grid',
            title: 'Группы шаблонов',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
            height: 300,
            clicksToEdit: 1,
            border:false,
            store: this.store,
            columns : this.Columns,
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
	            pageSize: 20,
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
	    App.examination.GroupGrid.superclass.initComponent.apply(this, arguments);

		this.on('afterrender', function(){
			this.store.load();
		}, this);
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

Ext.reg('groupgrid', App.examination.GroupGrid);
