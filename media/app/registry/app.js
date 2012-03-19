Ext.ns('App.settings');

Ext.onReady(function(){

	App.direct.numeration.getPrinterBySlug('registry',function websocket_init(res,e) {
		if(res.success) {
	    	d = res.data;
	    	App.WebSocket = new WebSocket(String.format("ws://{0}:{1}/",d.address,d.port));
	    	App.WebSocket.onopen = function() {
	    		console.log("printserver connected");
	    	};
	    	App.WebSocket.onmessage = function(e) {
	    		console.log("printserver message: " + e.data);
	    	};
	    	App.WebSocket.onclose = function() {
	    		console.log("printserver disconnected");
	    	};
	    	App.WebSocket.onerror = function() {
	    		console.log("printserver error");
	    	};
		} else {
			// printer not found handler
		}
    }, this);

	Ext.QuickTips.init();
	
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