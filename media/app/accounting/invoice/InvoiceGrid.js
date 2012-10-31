Ext.ns('App.accounting');


App.accounting.InvoiceGrid = Ext.extend(Ext.grid.GridPanel, {
    
    initComponent: function() {
        
        this.store = new Ext.data.RESTStore({
            autoSave : false,
            autoLoad : false,
            apiUrl : get_api_url('acc_contract'),
            model: App.models.AccountingContract
        });

        this.columns = [{
            header: "Дата",
            dataIndex: 'date',
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

});


Ext.reg('invoicegrid', App.accounting.InvoiceGrid);