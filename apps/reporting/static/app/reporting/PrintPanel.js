Ext.ns('App.reporting');

App.reporting.PrintPanel = Ext.extend(Ext.Panel, {
    
    initComponent: function() {
        
        this.printBtn = new Ext.Button({
            iconCls:'silk-printer',
            text:'Печать',
            handler:this.onPrint.createDelegate(this,[]),
            scope:this
        });
        this.previewPanel = new Ext.Panel({
            autoLoad:this.url,
            autoScroll:true,
            border:false
        })
        var config = {
            layout: 'fit',
            padding:3,
            border:false,
            items: [
                this.previewPanel
            ],
            tbar:[this.printBtn,'-',{
                text:'Обновить',
                iconCls:'x-tbar-loading',
                handler:function(){
                    this.previewPanel.load(this.url);
                },
                scope:this
            }]
        };
        
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.reporting.PrintPanel.superclass.initComponent.call(this);
    },
    
    onPrint:function(){
        var url = String.format('/reporting/{0}/print/?{1}',this.slug,this.params);
        window.open(url);
    }
    
});

Ext.reg('printspanel', App.reporting.PrintPanel);