Ext.ns('App.accounting');


App.accounting.InvoiceForm = Ext.extend(Ext.form.FormPanel, {
    
    initComponent: function() {
        config = {
        }
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.InvoiceForm.superclass.initComponent.apply(this, arguments);

    }

});


Ext.reg('accinvoiceform', App.accounting.InvoiceForm);