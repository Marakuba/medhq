Ext.ns('App.accounting');


App.accounting.ContractGrid = Ext.extend(Ext.grid.GridPanel, {
    
    initComponent: function() {
        
        this.store = new Ext.data.RESTStore({
            autoSave : false,
            autoLoad : false,
            apiUrl : get_api_url('acc_contract'),
            model: App.models.AccountingContract
        });

        this.columns = [{
            header: "№",
            dataIndex: 'number',
            width:15
        },{
            header: "Дата",
            dataIndex: 'date',
            width:20
        },{
            header: "Организация",
            dataIndex: 'state_name',
            width:100
        },{
            header: "Филиал",
            dataIndex: 'branch_price',
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
        App.accounting.ContractGrid.superclass.initComponent.apply(this, arguments);

    },

});


Ext.reg('contractgrid', App.accounting.ContractGrid);