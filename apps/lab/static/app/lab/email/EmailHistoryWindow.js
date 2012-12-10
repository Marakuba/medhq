Ext.ns('App.lab');

App.lab.EmailHistoryWindow = Ext.extend(Ext.Window, {

    initComponent:function(){
        
        this.grid = new App.lab.EmailHistoryGrid({
            labOrderId:this.labOrderId
        });
        
        config = {
            title:'История отправки ордера '+this.barcodeId,
            width:450,
            autoHeight:true,
            items: this.grid,
            modal:true,
            buttons:[{
                text:'Закрыть',
                handler:function(){
                    this.close();
                },
                scope:this
            }]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.lab.EmailHistoryWindow.superclass.initComponent.apply(this, arguments);
    }

});