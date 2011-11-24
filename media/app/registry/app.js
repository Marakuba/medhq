Ext.ns('App.settings');

Ext.onReady(function(){
	
	Ext.QuickTips.init();
	
//	if(App.settings.enableWS) {
//		websocket_init();
//	}
	
	Ext.Ajax.defaultHeaders = {Accept:'application/json'};
	
//	App.settings.reloadPriceByPaymentType = false;
	
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