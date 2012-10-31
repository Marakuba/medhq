Ext.ns('App.accounting');


App.accounting.ContractApp = Ext.extend(Ext.Panel, {

    initComponent: function() {

    	this.contractGrid = new App.accounting.ContractGrid({
    		region:'west',
    		width:800,
            border:true,
            style:{
                borderLeft:"solid 1px #99BBE8"
            },
            listeners:{
                scope:this,
                rowselect:this.onContractSelect
            }
    	});

    	this.invoiceGrid = new App.accounting.InvoiceGrid({
    		region:'center'
    	});

        config = {
            title:'Договоры',
            layout:'border',
            items:[this.contractGrid,this.invoiceGrid]
        }
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.ContractApp.superclass.initComponent.apply(this, arguments);

    },


    onContractSelect: function(record){
        this.invoiceGrid.setContract(record)
    }

});


Ext.reg('accounting', App.accounting.ContractApp);
