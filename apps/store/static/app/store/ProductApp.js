Ext.ns('App.store');

App.store.ProductApp = Ext.extend(Ext.Panel, {
    initComponent : function() {

        this.productPanel = new App.store.ProductTreeGrid({
            region:'center',
            border:false
        });

        var config = {
            id:'product-app',
            closable:true,
            title: 'Продукты',
            layout: 'border',
            items: [
                this.productPanel
            ]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.service.ProductApp.superclass.initComponent.apply(this, arguments);

        this.on('afterrender',function(){
        },this);
    }

});

Ext.reg('productapp', App.store.ProductApp);


App.webapp.actions.add('productapp', new Ext.Action({
    text: 'Продукты',
    scale: 'medium',
    handler: function(){
        WebApp.fireEvent('launchapp','productapp');
    }
}));
