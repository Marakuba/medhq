Ext.ns('App.reporting');

App.reporting.PrintPanel = Ext.extend(Ext.Panel, {
	
    initComponent: function() {
    	
    	this.printBtn = new Ext.Button({
    		text:'Печать',
    		handler:this.onPrint.createDelegate(this,[]),
    		scope:this
    	});
    	this.previewPanel = new Ext.Panel({
    		autoLoad:this.url
    	})
    	var config = {
			layout: 'fit',
            items: [
            	this.previewPanel
            ],
            tbar:[this.printBtn]
        };
        
		Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.reporting.PrintPanel.superclass.initComponent.call(this);
    },
    
    onPrint:function(){
    	var url = String.format('/old/reporting/{0}/test_print/?{1}',this.slug,this.params);
		window.open(url);
    }
    
});

Ext.reg('printspanel', App.reporting.PrintPanel);