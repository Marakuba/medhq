
Ext.onReady(function(){
	
	Ext.QuickTips.init();
	
	Ext.Ajax.defaultHeaders = {Accept:'application/json'};
	
	var centralPanel = new App.OldExamCentralPanel({
	});
	
	var viewport = new Ext.Viewport({
		layout:'border',
		items:[centralPanel]
	});
	
	centralPanel.launchApp('oldordergrid');
	
});