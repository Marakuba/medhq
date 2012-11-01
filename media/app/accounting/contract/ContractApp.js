Ext.ns('App.accounting');


App.accounting.ContractApp = Ext.extend(Ext.Panel, {

    initComponent: function() {

        this.contractGrid = new App.accounting.ContractGrid({
            region:'center',
            border:false,
            listeners:{
                scope:this,
                rowselect:this.onContractSelect
            }
        });

        this.invoiceGrid = new App.accounting.InvoiceGrid({
            region:'east',
            split:true,
            width:350
        });

        config = {
            title:'Договоры',
            layout:'border',
            items:[this.contractGrid,this.invoiceGrid]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.ContractApp.superclass.initComponent.apply(this, arguments);

    },


    onContractSelect: function(record){
        this.invoiceGrid.setContract(record);
    }

});


Ext.reg('accounting', App.accounting.ContractApp);
