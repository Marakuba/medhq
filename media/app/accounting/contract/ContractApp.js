Ext.ns('App.accounting');


App.accounting.ContractApp = Ext.extend(Ext.Panel, {
    
    initComponent: function() {
        config = {
            title:'Договоры',
        }
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.ContractApp.superclass.initComponent.apply(this, arguments);

    }

});


Ext.reg('accounting', App.accounting.ContractApp);