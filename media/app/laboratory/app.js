
Ext.onReady(function(){
	
	App.direct.numeration.getPrinterBySlug('lab',function websocket_init(res,e) {
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
	
	Ext.state.Manager.setProvider(
	    new Ext.state.CookieProvider({
	        expires: new Date(new Date().getTime()+(1000*60*60*24*3)), //1 year from now
	}));
	
	Ext.QuickTips.init();
	
	Ext.Ajax.defaultHeaders = {Accept:'application/json'};
	
	var centralPanel = new App.CentralPanel({
	});
	
	var viewport = new Ext.Viewport({
		layout:'border',
		items:[centralPanel]
	});
	
	new Ext.KeyMap(document, {
	    key: Ext.EventObject.F3,
	    handler: function(){ 
	    	centralPanel.onSearch();
	    },
	    scope: this,
	    stopEvent: true
	});
	
	new Ext.KeyMap(document, {
	    key: Ext.EventObject.F8,
	    handler: function(){ 
	    	centralPanel.onClearSearch();
	    },
	    scope: this,
	    stopEvent: true
	});
	
	new Ext.KeyMap(document, {
	    key: Ext.EventObject.F7,
	    handler: function(){ 
	    	centralPanel.openScannerWindow();
	    },
	    scope: this,
	    stopEvent: true
	});
	
	centralPanel.launchApp('labboard');
	centralPanel.launchApp('manualgrid',{},false);

    
});