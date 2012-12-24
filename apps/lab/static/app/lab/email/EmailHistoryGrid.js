Ext.ns('App.lab');



App.lab.EmailHistoryGrid = Ext.extend(Ext.grid.GridPanel, {

    initComponent : function() {

        this.proxy = new Ext.data.HttpProxy({
            url: App.utils.getApiUrl('lab','emailhistory')
        });

        this.reader = new Ext.data.JsonReader({
            totalProperty: 'meta.total_count',
            successProperty: 'success',
            idProperty: 'id',
            root: 'objects',
            messageProperty: 'message'
        }, [
            {name: 'id'},
            {name: 'resource_uri'},
            {name: 'created', type:'date', dateFormat:'c'},
            {name: 'email_task'},
            {name: 'created_by_name'},
            {name: 'status'},
            {name: 'status_text'}
        ]);

        this.writer = new Ext.data.JsonWriter({
            encode: false
        });
        this.baseParams = {
            format:'json',
            email_task__lab_order:this.labOrderId
        };
        this.store = new Ext.data.Store({
            autoLoad:true,
            baseParams: this.baseParams,
            paramNames: {
                start : 'offset',
                limit : 'limit',
                sort : 'sort',
                dir : 'dir'
            },
            restful: true,
            proxy: this.proxy,
            reader: this.reader,
            writer: this.writer
        });

        this.columns =  [{
            header: "Дата/время",
            width: 45,
            sortable: false,
            dataIndex: 'created',
            renderer: Ext.util.Format.dateRenderer('d.m.y / H:i:s')
        },{
            header: "Статус",
            width: 70,
            sortable: false,
            dataIndex: 'status_text'
        },{
            header: "Оператор",
            width: 60,
            sortable: false,
            dataIndex: 'created_by_name'
        }];

        var config = {
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            height:250,
            border : false,
            store:this.store,
            columns:this.columns,
            clicksToEdit:1,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true
            }),
            viewConfig : {
                forceFit : true,
                emptyText: 'нет записей'
            }
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.lab.EmailHistoryGrid.superclass.initComponent.apply(this, arguments);
    }

});
