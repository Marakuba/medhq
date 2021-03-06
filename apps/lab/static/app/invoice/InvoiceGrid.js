Ext.ns('App.invoice');

App.invoice.InvoiceGrid = Ext.extend(Ext.grid.GridPanel, {

    initComponent : function() {

        this.store = new Ext.data.RESTStore({
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('lab','invoice'),
            model: App.models.Invoice
        });

        this.store.load();

        this.columns =  [
            {
                header: "№",
                width:8,
                sortable: true,
                dataIndex: 'id'
            },{
                header: "Дата",
                width:20,
                sortable: true,
                dataIndex: 'created',
                renderer:Ext.util.Format.dateRenderer('d.m.Y')
            },{
                header: "Офис",
                width: 50,
                sortable: true,
                dataIndex: 'office_name'
            },{
                header: "Лаборатория",
                width: 50,
                sortable: true,
                dataIndex: 'state_name'
            },{
                header: "Оператор",
                width: 25,
                sortable: true,
                dataIndex: 'operator_name'
            }
        ];



        var config = {
            id:'invoice-grid-app',
            closable:true,
            title:'Накладные',
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
            },{
                text:'Изменить',
                iconCls:'silk-pencil',
                handler:this.onChange.createDelegate(this),
                scope:this
            },'-',{
                iconCls:'silk-printer',
                text:'Печать реестра',
                handler:this.onPrint.createDelegate(this),
                scope:this
            }],
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
                emptyText: 'Нет записей'
            })

        }

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.invoice.InvoiceGrid.superclass.initComponent.apply(this, arguments);
        WebApp.on('invoicecreate', this.onInvoiceCreate, this);
        this.store.on('write', this.onStoreWrite, this);

        this.on('destroy', function(){
            WebApp.un('invoicecreate',this.onInvoiceCreate, this);
        },this);
    },

    onInvoiceCreate: function(){
        this.store.load();
    },

    onGlobalSearch: function(v) {
        this.storeFilter('search', v);
    },

    storeFilter: function(field, value){
        if(value===undefined) {
            delete this.store.baseParams[field];
        } else {
            this.store.setBaseParam(field, value);
        }
        this.store.load();
    },

    getSelected: function() {
        return this.getSelectionModel().getSelected();
    },

    onPrint: function() {
        var id = this.getSelected().data.id;
        var url = ['/lab/print/invoice',id,''].join('/');
        window.open(url);
    },

    onCreate: function() {
        WebApp.fireEvent('launchapp','invoicetab',{
        });
    },

    onChange: function(rowindex){
        var record = this.getSelected();
        if(record) {
            WebApp.fireEvent('launchapp','invoicetab',{
                record:record
            });
        }
    },

    onDelete: function() {

    },

    onStoreWrite: function(store, action, result, res, rs) {
    }

});



Ext.reg('invoicegrid', App.invoice.InvoiceGrid);


App.webapp.actions.add('invoicegrid', new Ext.Action({
    text: 'Накладные',
    scale: 'medium',
    handler: function(){
        WebApp.fireEvent('launchapp','invoicegrid');
    }
}));