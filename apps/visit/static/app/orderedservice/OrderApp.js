Ext.ns('App.orderedservice');

App.orderedservice.OrderApp = Ext.extend(Ext.TabPanel, {

    initComponent : function() {
        
        this.origTitle = 'Заказы';
        
        config = {
            closable:true,
            title:'Заказы',
            tabPosition:'bottom',
            activeItem:this.activeItem || 0,
            items:[{
                xtype:'localordergrid',
                searchValue:this.searchValue
            },{
                xtype:'remoteordergrid',
                searchValue:this.searchValue
            }]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.orderedservice.OrderApp.superclass.initComponent.apply(this, arguments);
        
        this.on('afterrender',function(){
            this.getItem(this.activeItem);
        },this);
    }
});


Ext.reg('orderapp', App.orderedservice.OrderApp);

App.orderedservice.OrderAppWidget = Ext.extend(Ext.SplitButton, {
    initComponent : function(config){
        config = {
            text: 'Заказы',
            scale: 'medium',
            handler: function(){
                WebApp.fireEvent('launchapp','orderapp', { activeItem:0 });
            },
            menu: new Ext.menu.Menu({
                items:[{
                    text:'Внешние заказы',
                    handler: function(){
                        WebApp.fireEvent('launchapp','orderapp', { activeItem:1 });
                    }
                }]
            })
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.orderedservice.OrderAppWidget.superclass.initComponent.apply(this, arguments);
    }
});


App.webapp.actions.add('orderapp', new App.orderedservice.OrderAppWidget());