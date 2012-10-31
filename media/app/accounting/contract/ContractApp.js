Ext.ns('App.accounting');


App.accounting.ContractApp = Ext.extend(Ext.Panel, {

    initComponent: function() {

    	this.contractGrid = new App.accounting.ContractGrid({
    		region:'west',
    		width:800,
            border:true,
            style:{
                borderLeft:"solid 1px #99BBE8"
            }
    	});

    	this.invoiceGrid = new App.accounting.InvoiceGrid({
    		region:'center'
    	});

        config = {
            title:'Договоры',
            layout:'border',
            items:[this.contractGrid,this.invoiceGrid],
            tbar:[{
                xtype:'button',
                iconCls:'silk-add',
                text:'Добавить договор',
                handler:this.onAddContract.createDelegate(this),
                scope:this
            }]
        }
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.ContractApp.superclass.initComponent.apply(this, arguments);

    },


    onAddContract: function(){
        var contractWin = new App.accounting.ContractWindow({
            store:this.contractGrid.store,
            fn:function(record){
                if(!record){
                    contractWin.close();
                    return false;
                };
                this.contractGrid.store.add(record);
                this.contractGrid.store.save();
                contractWin.close();
            },
            scope:this
        });

        contractWin.show();
    }

});


Ext.reg('accounting', App.accounting.ContractApp);
