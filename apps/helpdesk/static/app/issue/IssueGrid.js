Ext.ns('App.issue');

App.issue.IssueGrid = Ext.extend(Ext.grid.GridPanel, {

    initComponent : function() {

        this.store = new Ext.data.RESTStore({
            autoLoad : true,
            apiUrl : App.utils.getApiUrl('helpdesk','issue'),
            model: [
                {name: 'id'},
                {name: 'resource_uri'},
                {name: 'type'},
                {name: 'type_name'},
                {name: 'title'},
                {name: 'level'},
                {name: 'level_name'},
                {name: 'status'},
                {name: 'status_name'},
                {name: 'operator_name'},
                {name: 'description'}
            ]
        });

        this.columns =  [
            {
                header: "Тикет",
                width:60,
                sortable: true,
                dataIndex: 'title',
                renderer: function(val,meta,rec) {
                    return String.format("<div><b>{0}</b><br>{1}</div>", rec.data.title, rec.data.type_name);
                }
            },{
                header: "Важность",
                width:20,
                sortable: true,
                dataIndex: 'level_name'
            },{
                header: "Статус",
                width: 20,
                sortable: true,
                dataIndex: 'status_name'
            },{
                header: "Оператор",
                width: 20,
                sortable: true,
                dataIndex: 'operator_name'
            }
        ];



        var config = {
            closable:true,
            title:'Тикеты',
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            stripeRows:true,
            border : false,
            store:this.store,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true,
                listeners:{
                    rowselect:function(sm,i,rec) {
                    },
                    rowdeselect:function(sm,i,rec) {
                    },
                    scope:this
                }
            }),
            tbar: [{
                text:'Создать',
                iconCls:'silk-add',
                handler:this.onCreate.createDelegate(this),
                scope:this
            }/*,{
                text:'Изменить',
                iconCls:'silk-pencil',
                handler:this.onChange.createDelegate(this),
                scope:this
            }*/],
            bbar: new Ext.PagingToolbar({
                pageSize: 100,
                store: this.store,
                displayInfo: true,
                displayMsg: 'Показана запись {0} - {1} из {2}',
                emptyMsg: "Нет записей"
            }),
            listeners: {
                rowdblclick:this.onChange.createDelegate(this),
                scope:this
            },
            view : new Ext.grid.GridView({
                forceFit : true,
                emptyText: 'Нет записей',
                enableRowBody:true,
                showPreview:true,
                getRowClass : function(record, rowIndex, p, store){
                    if(this.showPreview){
                        p.body = '<p class="helpdesk-row-body">'+record.data.description+'</p>';
                        return 'x-grid3-row-expanded';
                    }
                    return 'x-grid3-row-collapsed';
                }
            })

        }

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.issue.IssueGrid.superclass.initComponent.apply(this, arguments);
//      WebApp.on('globalsearch', this.onGlobalSearch, this);
        this.store.on('write', this.onStoreWrite, this);
    },

    onGlobalSearch: function(v) {
        this.storeFilter('search', v);
    },

    storeFilter: function(field, value){
        if(value===undefined) {
            delete this.store.baseParams[field]
        } else {
            this.store.setBaseParam(field, value);
        }
        this.store.load();
    },

    getSelected: function() {
        return this.getSelectionModel().getSelected()
    },

    onPrint: function() {
//      var id = this.getSelected().data.id;
//      var url = ['/lab/print/results',id,''].join('/');
//      window.open(url);
    },

    onCreate: function() {
        this.win = new App.issue.IssueWindow({
            model:this.store.recordType,
            scope:this,
            fn:function(record){
                this.store.insertRecord(record);
            }
        });
        this.win.show();
    },

    onChange: function(rowindex){
        var record = this.getSelected();
        if(record) {
            this.win = new App.issue.IssueWindow({
                record:record,
                model:this.store.recordType,
                scope:this,
                fn:function(record){
                    //this.store.Record(record);
                }
            });
            this.win.show();
        }
    },

    onDelete: function() {

    },

    onStoreWrite: function(store, action, result, res, rs) {
        if( res.success && this.win ) {
            this.win.close();
        }
    }

});



Ext.reg('issuegrid', App.issue.IssueGrid);
