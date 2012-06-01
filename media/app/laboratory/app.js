Ext.ns('App.barcoding');

Ext.onReady(function(){
	
	Ext.QuickTips.init();
	
	Ext.Ajax.defaultHeaders = {Accept:'application/json'};
	
	Ext.state.Manager.setProvider(
		    new Ext.state.CookieProvider({
		        expires: new Date(new Date().getTime()+(1000*60*60*24*3)), //1 year from now
		}));
	
	App.direct.numeration.getPrinterBySlug('lab',function(res,e) {
		if(res && res.success) {
			App.barcoding.printers = res.data.printers;
			if(App.barcoding.printers.length) {
				var printer = Ext.state.Manager.getProvider().get('lab_printer');
				
				if(!printer){
					printer = App.barcoding.printers[0];
					Ext.state.Manager.getProvider().set('lab_printer', printer);
				}
				App.WebSocket = new WebSocket(String.format("ws://{0}:{1}/",printer.address,printer.port));
		    	App.WebSocket.onopen = function() {
		    	};
		    	App.WebSocket.onmessage = function(e) {
		    	};
		    	App.WebSocket.onclose = function() {
		    	};
		    	App.WebSocket.onerror = function() {
		    	};
			}
		} else {
			// printer not found handler
		}
    }, this);
	
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