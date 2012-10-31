Ext.ns('App.accounting');


App.accounting.InvoiceApp = Ext.extend(Ext.Panel, {
    
    initComponent: function() {

        this.contractStore = new Ext.data.RESTStore({
            autoSave : false,
            autoLoad : false,
            apiUrl : get_api_url('acc_contract'),
            model: App.models.AccountingContract
        });

        this.form = new App.accounting.InvoiceForm({
            region:'north',
            height:50
        });

        this.patientGrid = new App.accounting.PatientGrid({
            region:'west',
            width:250
        });

        this.serviceTree = new App.ServiceTreeGrid({
            region:'east',
            split:true,
            width:300,
            listeners: {
                serviceclick: this.onServiceClick.createDelegate(this)
            }
        });

        this.basket = new App.accounting.InvoiceItemGrid({
            region:'center'
        });

        config = {
            title:'Счет',
            layout:'border',
            items:[this.form, this.patientGrid, this.basket, this.serviceTree]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.InvoiceApp.superclass.initComponent.apply(this, arguments);

        this.on('afterrender', function(){
            if(this.contractId){
                this.contractStore.load({
                    params:{
                        id:this.contractId
                    },
                    callback:function(rs, opts){
                        console.info(rs);
                    }
                })
            }
        }, this);

    },

    onServiceClick: function(node){
        console.info(node.attributes);
    }

});


Ext.reg('accinvoiceapp', App.accounting.InvoiceApp);