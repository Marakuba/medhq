Ext.ns('App.examination');
Ext.ns('Ext.ux');

App.examination.PatientHistoryPanel = Ext.extend(Ext.Panel, {
	
    initComponent: function() {
    	
    	var config = {
			layout: 'fit',
			autoScroll:true,
            items: [
                
            ]
        };
        
		Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.PatientHistoryPanel.superclass.initComponent.call(this);
    }
    
});