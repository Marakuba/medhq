Ext.ns('App','App.examination');
Ext.ns('Ext.ux');

App.examination.PatientHistoryPanel = Ext.extend(Ext.Panel, {
	
    initComponent: function() {
    	
    	this.history_tree = new App.PatientHistoryTreeGrid({
    		baseParams: {
    			patient:this.patient,
    			get_year:true,
    			get_month:true
    		}
    	});
    	
    	var config = {
			layout: 'fit',
			autoScroll:true,
            items: [
            	this.history_tree
            ]
        };
        
		Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.PatientHistoryPanel.superclass.initComponent.call(this);
    }
    
});