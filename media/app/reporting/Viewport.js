Ext.ns('App');

Ext.onReady(function() {

	Ext.Ajax.defaultHeaders = {Accept:'application/json'};
	
	var reportGrid = new App.reporting.Grid({
		id:'reports-tab'
	})
	
	var mainPanel = new Ext.TabPanel({
    	id:'main-tab-panel',
        region: 'center',
        border: true,
        activeTab: 0,
        items: [reportGrid]
    });
    
    reportGrid.on('reportchange', function(record){
    	var tab = new App.reporting.Designer({
    		id: 'report-tab-'+record.id,
    		record: record
    	});
    	var new_tab = mainPanel.add(tab);
    	mainPanel.setActiveTab(new_tab);
    	//new_tab.on('close', function(){
    		
    	//});
    });
    
    var viewport = new Ext.Viewport({
    	layout:'border',
    	items:[mainPanel]
    });
	
});