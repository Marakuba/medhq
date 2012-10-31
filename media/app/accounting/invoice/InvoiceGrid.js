Ext.ns('App.accounting');


App.accounting.InvoiceGrid = Ext.extend(Ext.grid.GridPanel, {

    initComponent: function() {

        this.addInvoiceBtn = new Ext.Button({
            iconCls:'silk-add',
            text:'Добавить счет',
            handler:this.onAddInvoice.createDelegate(this),
            scope:this
        });

        this.editInvoiceBtn = new Ext.Button({
            iconCls:'silk-add',
            text:'Изменить счет',
            handler:this.onEditInvoice.createDelegate(this),
            scope:this
        });

        this.store = new Ext.data.RESTStore({
            autoSave : false,
            autoLoad : false,
            apiUrl : get_api_url('acc_invoice'),
            model: App.models.AccountingContract
        });

        this.columns = [{
            header: "Дата",
            dataIndex: 'on_date',
            renderer:Ext.util.Format.dateRenderer('d.m.Y'),
            width:20
        },{
            header: "Номер",
            dataIndex: 'number',
            width:15
        },{
            header: "Сумма",
            dataIndex: 'total_price',
            width:100
        }];

        config = {
            border: false,
            store:this.store,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true,
                listeners: {
                    rowselect: function(sm, row, rec) {

                    },
                    rowdeselect: function(sm, row, rec) {
                    },
                    scope:this
                }
            }),
            tbar:[this.addInvoiceBtn,this.editInvoiceBtn],
            viewConfig : {
                forceFit : true
                //getRowClass : this.applyRowClass
            },
            listeners: {
                scope:this
            }
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.InvoiceGrid.superclass.initComponent.apply(this, arguments);

    },

    setContract: function(record){
        this.store.setBaseParam('contract',record.data.id);
        this.store.load();
        this.contract = record
    },

    onAddInvoice: function(){
        if (this.contract){
            // centralPanel.launchApp('accinvoiceapp', {
        // // contractId: 1
        //     invoiceId: rec.data.id
        // }, true);
        }
    },
    onEditInvoice: function(){
        var rec = this.getSelectionModel().getSelected();
        // centralPanel.launchApp('accinvoiceapp', {
        // // contractId: 1
        //     invoiceId: rec.data.id
        // }, true);
    }

});


Ext.reg('invoicegrid', App.accounting.InvoiceGrid);
