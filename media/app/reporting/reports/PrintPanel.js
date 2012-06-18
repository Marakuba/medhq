Ext.ns('App.reporting');

App.reporting.PrintPanel = Ext.extend(Ext.Panel, {
	
    initComponent: function() {
    	
    	this.printBtn = new Ext.Button({
    		text:'Печать',
    		handler:this.onPrint.createDelegate(this,[]),
    		scope:this
    	});
    	var config = {
			layout: 'fit',
            items: [
            ],
            tbar:[this.printBtn]
        };
        
		Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.reporting.PrintPanel.superclass.initComponent.call(this);
    },
    
    onPrint:function(){}
    
});

Ext.reg('printpanel', App.reporting.PrintPanel);