
Ext.onReady(function(){
	
	Ext.QuickTips.init();
	
	Ext.Ajax.defaultHeaders = {Accept:'application/json'};
	
	var centralPanel = new App.calendar.CentralPanel({
		//region:north
	});
	
	var viewport = new Ext.Viewport({
		layout:'border',
		items:[centralPanel]
	});
	
	centralPanel.launchApp('doctorscheduler');
	
});