
Ext.onReady(function(){
	
	Ext.QuickTips.init();
	
	Ext.Ajax.defaultHeaders = {Accept:'application/json'};
	
	var products = new Ext.Panel({
		region:'east',
		width:300,
		margins:'5 5 5 0',
		header:false,
		collapsible:true,
		collapseMode:'mini',
		split:true
	});
	
	var centralPanel = new App.CentralPanel({
	});
	
	var viewport = new Ext.Viewport({
		layout:'border',
		items:[centralPanel]
	});
	
	centralPanel.launchApp('labordergrid');
	
});