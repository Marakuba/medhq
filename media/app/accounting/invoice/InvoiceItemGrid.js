Ext.ns('App.accounting');


App.accounting.InvoiceItemGrid = Ext.extend(Ext.grid.GridPanel, {
    
    initComponent: function() {
        
        this.store = new Ext.data.RESTStore({
            autoSave : false,
            autoLoad : false,
            apiUrl : get_api_url('acc_invoice_item'),
            model: App.models.AccountingInvoiceItem
        });

        this.columns = [{
            header: "Пациент",
            dataIndex: 'patient_name'
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
            tbar:[{
                text:'Add'
            }],
            viewConfig : {
                forceFit : true
                //getRowClass : this.applyRowClass
            },
            listeners: {
                scope:this
            }
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.InvoiceItemGrid.superclass.initComponent.apply(this, arguments);

    }

});


Ext.reg('accinvoiceitemgrid', App.accounting.InvoiceItemGrid);