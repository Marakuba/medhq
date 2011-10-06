Ext.ns('App.settings');

Ext.onReady(function(){
	
	Ext.QuickTips.init();
	
	Ext.Ajax.defaultHeaders = {Accept:'application/json'};
	
	App.settings.reloadPriceByPaymentType = true;
	
	var centralPanel = new App.CentralPanel({
	});
	
	var viewport = new Ext.Viewport({
		layout:'border',
		items:[centralPanel]
	});
	
	centralPanel.launchApp('patients');
	centralPanel.launchApp('visits',{},false);
	centralPanel.launchApp('results',{},false);
	
});