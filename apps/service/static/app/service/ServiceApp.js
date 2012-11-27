Ext.ns('App.service');

App.service.ServiceApp = Ext.extend(Ext.Panel, {
    initComponent : function() {
        
        this.servicePanel = new App.service.ServiceTreeGrid({
            region:'center',
            border:false
        });
        
        var config = {
            id:'service-app',
            closable:true,
            title: 'Услуги',
            layout: 'border',
            items: [
                this.servicePanel
            ]
        };
        
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.service.ServiceApp.superclass.initComponent.apply(this, arguments);
        
        this.on('afterrender',function(){
        },this);
    }
    
});

Ext.reg('serviceapp', App.service.ServiceApp);


App.webapp.actions.add('serviceapp', new Ext.Action({
    text: 'Услуги',
    scale: 'medium',
    handler: function(){
        WebApp.fireEvent('launchapp','serviceapp');
    }
}));